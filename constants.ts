import { CalculatorState, FeeType, Mode, RoundingMode } from './types';

export const DEFAULT_STATE: CalculatorState = {
  mode: Mode.TARGET_PROFIT,
  
  productName: 'Produk Baru',
  cogs: 50000,
  packagingCost: 2000,
  handlingCost: 0,
  returnRate: 0,

  adminFee: 6.5, // Common Shopee Star+ fee estimate
  transactionFee: 4.0,
  otherPlatformFee: 0,
  otherPlatformFeeType: FeeType.PERCENT,

  voucherType: FeeType.PERCENT,
  voucherValue: 0,
  bundleDiscount: 0,
  coinsCashback: 0,

  adsType: 'Shopee Ads',
  adsMode: FeeType.PERCENT,
  adsValue: 8, // Moderate default
  affiliateFee: 0,

  shippingSubsidy: 0,
  packagingExtra: 0,

  targetMode: FeeType.PERCENT,
  targetValue: 20, // 20% Net Margin
  taxReserve: 0,

  overheadMode: FeeType.PERCENT,
  overheadValue: 0,

  rounding: RoundingMode.NEAREST_500,
  manualPrice: 100000,
};

export const ADS_PRESETS = [
  { label: 'Low Ads (3%)', value: 3 },
  { label: 'Normal Ads (8%)', value: 8 },
  { label: 'Aggressive (15%)', value: 15 },
];