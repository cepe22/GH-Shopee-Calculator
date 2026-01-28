import { CalculationResult, CalculatorState, FeeType, Mode, RoundingMode } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number) => {
  return `${value.toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`;
};

// Core logic to compute profit from a specific price
export const calculateMetrics = (price: number, state: CalculatorState): CalculationResult => {
  // 1. Product Cost
  const baseCost = state.cogs + state.packagingCost + state.handlingCost;
  const returnsReserve = baseCost * (state.returnRate / 100);
  const totalProductCost = baseCost + returnsReserve;

  // 2. Platform Fees
  const platformPercentTotal = (state.adminFee + state.transactionFee) / 100;
  let platformFee = price * platformPercentTotal;
  if (state.otherPlatformFeeType === FeeType.PERCENT) {
    platformFee += price * (state.otherPlatformFee / 100);
  } else {
    platformFee += state.otherPlatformFee;
  }

  // 3. Promotion
  let promoCost = 0;
  if (state.voucherType === FeeType.PERCENT) {
    promoCost += price * (state.voucherValue / 100);
  } else {
    promoCost += state.voucherValue;
  }
  promoCost += price * (state.bundleDiscount / 100);
  promoCost += price * (state.coinsCashback / 100);

  // 4. Marketing
  let marketingCost = 0;
  if (state.adsMode === FeeType.PERCENT) {
    marketingCost += price * (state.adsValue / 100);
  } else {
    marketingCost += state.adsValue;
  }
  marketingCost += price * (state.affiliateFee / 100);

  // 5. Logistics
  const totalLogisticCost = state.shippingSubsidy + state.packagingExtra;

  // 6. Overhead & Tax
  let overheadCost = 0;
  if (state.overheadMode === FeeType.PERCENT) {
    overheadCost += price * (state.overheadValue / 100);
  } else {
    overheadCost += state.overheadValue;
  }
  const taxCost = price * (state.taxReserve / 100);
  const totalOverheadAndTax = overheadCost + taxCost;

  // Final Calculations
  const totalCosts = totalProductCost + platformFee + promoCost + marketingCost + totalLogisticCost + totalOverheadAndTax;
  const netProfit = price - totalCosts;
  const netMargin = price > 0 ? netProfit / price : 0;

  // Break Even: Profit = 0
  // 0 = Price - (FixedCosts + Price * VariableRate)
  // Price * (1 - VariableRate) = FixedCosts
  // BEP = FixedCosts / (1 - VariableRate)
  
  // Calculate variable rate sum
  const variableRate = 
    platformPercentTotal + 
    (state.otherPlatformFeeType === FeeType.PERCENT ? state.otherPlatformFee / 100 : 0) +
    (state.voucherType === FeeType.PERCENT ? state.voucherValue / 100 : 0) + 
    (state.bundleDiscount / 100) + 
    (state.coinsCashback / 100) +
    (state.adsMode === FeeType.PERCENT ? state.adsValue / 100 : 0) +
    (state.affiliateFee / 100) +
    (state.overheadMode === FeeType.PERCENT ? state.overheadValue / 100 : 0) +
    (state.taxReserve / 100);

  const fixedCosts = 
    totalProductCost + 
    (state.otherPlatformFeeType === FeeType.RP ? state.otherPlatformFee : 0) +
    (state.voucherType === FeeType.RP ? state.voucherValue : 0) +
    (state.adsMode === FeeType.RP ? state.adsValue : 0) +
    totalLogisticCost +
    (state.overheadMode === FeeType.RP ? state.overheadValue : 0);

  const breakEvenPrice = variableRate < 1 ? fixedCosts / (1 - variableRate) : 0; // Avoid infinity

  // Safety Analysis
  // Max Voucher allowed to hit target? (Simplified: assumes current price remains fixed)
  // This is tricky because changing voucher changes target logic. 
  // We will estimate it based on "Remaining Profit Margin" available.
  const currentMarginPercent = netMargin * 100;
  const targetMarginVal = state.targetMode === FeeType.PERCENT ? state.targetValue : (state.targetValue / price) * 100;
  // If we have extra margin, we can add it to voucher. If we are missing margin, we need to cut voucher.
  // Note: This is an approximation for the user.
  let maxVoucherPercent = 0;
  if (state.voucherType === FeeType.PERCENT) {
     maxVoucherPercent = state.voucherValue + (currentMarginPercent - targetMarginVal);
  } else {
     // If current voucher is Rp, we convert available margin to %
     maxVoucherPercent = (currentMarginPercent - targetMarginVal);
  }

  // Max Ads allowed
  let maxAdsPercent = 0;
  if (state.adsMode === FeeType.PERCENT) {
    maxAdsPercent = state.adsValue + (currentMarginPercent - targetMarginVal);
  } else {
     maxAdsPercent = (currentMarginPercent - targetMarginVal);
  }

  return {
    sellingPrice: price,
    grossRevenue: price,
    totalProductCost,
    totalPlatformFees: platformFee,
    totalPromoCost: promoCost,
    totalMarketingCost: marketingCost,
    totalLogisticCost,
    totalOverheadAndTax,
    netProfit,
    netMargin,
    breakEvenPrice: breakEvenPrice > 0 ? breakEvenPrice : 0,
    maxVoucherPercent: parseFloat(maxVoucherPercent.toFixed(2)),
    maxAdsPercent: parseFloat(maxAdsPercent.toFixed(2)),
    breakdown: [
      { label: 'Harga Jual', value: price, isDeduction: false },
      { label: 'Total HPP & Retur', value: totalProductCost, isDeduction: true },
      { label: 'Fee Platform Shopee', value: platformFee, isDeduction: true },
      { label: 'Biaya Promosi', value: promoCost, isDeduction: true },
      { label: 'Biaya Iklan & Mkt', value: marketingCost, isDeduction: true },
      { label: 'Logistik', value: totalLogisticCost, isDeduction: true },
      { label: 'Ops & Pajak', value: totalOverheadAndTax, isDeduction: true },
      { label: 'Profit Bersih', value: netProfit, isDeduction: false },
    ]
  };
};

export const solveForTarget = (state: CalculatorState): CalculationResult => {
  // Binary search to find price
  let low = state.cogs;
  let high = state.cogs * 100; // Arbitrary upper limit
  let solution = high;

  // Safety check for infinite loop / impossible targets
  // If variable costs are >= 100%, profit is impossible regardless of price
  // (We check this implicitly by the loop limits, but ideally we'd pre-check rates)

  for (let i = 0; i < 50; i++) { // 50 iterations is plenty for precision
    const mid = (low + high) / 2;
    const result = calculateMetrics(mid, state);
    
    let isEnough = false;
    
    if (state.targetMode === FeeType.RP) {
      isEnough = result.netProfit >= state.targetValue;
    } else {
      isEnough = (result.netMargin * 100) >= state.targetValue;
    }

    if (isEnough) {
      solution = mid;
      high = mid; // Try lower
    } else {
      low = mid; // Need higher price
    }
  }

  // Apply rounding
  let finalPrice = solution;
  if (state.rounding === RoundingMode.NEAREST_500) {
    finalPrice = Math.ceil(solution / 500) * 500;
  } else if (state.rounding === RoundingMode.NEAREST_1000) {
    finalPrice = Math.ceil(solution / 1000) * 1000;
  }

  // Re-calculate with rounded price to get exact final figures
  return calculateMetrics(finalPrice, state);
};

export const roundTo = (num: number, roundMode: RoundingMode) => {
    if (roundMode === RoundingMode.NONE) return Math.round(num);
    if (roundMode === RoundingMode.NEAREST_500) return Math.round(num / 500) * 500;
    return Math.round(num / 1000) * 1000;
};
