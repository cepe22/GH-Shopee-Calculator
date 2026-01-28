export enum Mode {
  TARGET_PROFIT = 'TARGET_PROFIT',
  GIVEN_PRICE = 'GIVEN_PRICE'
}

export enum FeeType {
  PERCENT = 'PERCENT',
  RP = 'RP'
}

export enum RoundingMode {
  NONE = 'NONE',
  NEAREST_500 = 'NEAREST_500',
  NEAREST_1000 = 'NEAREST_1000'
}

export interface CalculatorState {
  // Mode
  mode: Mode;
  
  // 1. Product & COGS
  productName: string;
  cogs: number;
  packagingCost: number;
  handlingCost: number;
  returnRate: number; // %

  // 2. Platform Fees
  adminFee: number; // %
  transactionFee: number; // %
  otherPlatformFee: number;
  otherPlatformFeeType: FeeType;

  // 3. Promotion
  voucherType: FeeType;
  voucherValue: number;
  bundleDiscount: number; // %
  coinsCashback: number; // %

  // 4. Ads
  adsType: string; // Label only
  adsMode: FeeType; // PERCENT (of revenue) or RP (per order)
  adsValue: number;
  affiliateFee: number; // %

  // 5. Logistics
  shippingSubsidy: number;
  packagingExtra: number;

  // 6. Target
  targetMode: FeeType; // RP (profit value) or PERCENT (margin)
  targetValue: number;
  taxReserve: number; // %

  // 7. Operational
  overheadMode: FeeType;
  overheadValue: number;

  // Settings
  rounding: RoundingMode;
  manualPrice: number; // Only for GIVEN_PRICE mode
}

export interface CalculationResult {
  sellingPrice: number;
  grossRevenue: number;
  
  // Costs
  totalProductCost: number;
  totalPlatformFees: number;
  totalPromoCost: number;
  totalMarketingCost: number;
  totalLogisticCost: number;
  totalOverheadAndTax: number;
  
  // Profits
  netProfit: number;
  netMargin: number; // 0-1 scale
  breakEvenPrice: number;
  
  // Breakdown
  breakdown: {
    label: string;
    value: number;
    isDeduction: boolean;
  }[];

  // Safety
  maxVoucherPercent: number;
  maxAdsPercent: number;
}