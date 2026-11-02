import { Decimal } from "decimal.js";
import { BASE_RATES_TO_NGN, Currency, RateSource, RateType, SUPPORTED_CURRENCIES } from "./mock-rates";

// Configure Decimal.js precision for financial accuracy
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface ConversionCalculation {
  baseAmount: string;
  baseCurrency: Currency;
  targetCurrency: Currency;
  rateType: RateType;
  effectiveRate: Decimal;
  inverseRate: Decimal;
  grossTargetAmount: Decimal;
  fixedFeeInBase: Decimal;
  percentFee: Decimal;
  totalFeeInBase: Decimal;
  totalFeeInTarget: Decimal;
  netTargetAmount: Decimal;
  rateSource: string;
  timestampWAT: string;
  isStale: boolean;
  spreadVsOfficialPercent: Decimal;
}

/**
 * Calculates the exact conversion between two currencies with fees and spread analysis.
 */
export function calculateConversion(
  amountStr: string,
  baseCode: string,
  targetCode: string,
  rateType: RateType = "official",
  selectedProviderId?: string
): ConversionCalculation {
  const baseCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === baseCode) || SUPPORTED_CURRENCIES[0];
  const targetCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === targetCode) || SUPPORTED_CURRENCIES[1];

  // Validate or default base amount
  let cleanAmount = amountStr.trim().replace(/,/g, "");
  if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) < 0) {
    cleanAmount = "0";
  }
  const baseAmount = new Decimal(cleanAmount);

  // Retrieve base and target rates relative to NGN
  const baseRateData = BASE_RATES_TO_NGN[baseCode] || { official: 1, bank: 1, provider: 1 };
  const targetRateData = BASE_RATES_TO_NGN[targetCode] || { official: 1, bank: 1, provider: 1 };

  const officialBaseToNgn = new Decimal(baseRateData.official);
  const officialTargetToNgn = new Decimal(targetRateData.official);
  const officialPairRate = officialBaseToNgn.dividedBy(officialTargetToNgn);

  let activeBaseToNgn = new Decimal(baseRateData[rateType] || baseRateData.official);
  let activeTargetToNgn = new Decimal(targetRateData[rateType] || targetRateData.official);

  let feeFixed = new Decimal(0);
  let feePercent = new Decimal(0);
  let sourceName = "CBN Official NFEM";

  if (rateType === "official") {
    sourceName = "Central Bank of Nigeria (NFEM)";
    feeFixed = new Decimal(0);
    feePercent = new Decimal(0);
  } else if (rateType === "bank") {
    sourceName = "Nigerian Commercial Banks (Average Interbank)";
    feeFixed = baseCode === "NGN" ? new Decimal(500) : new Decimal(4.50);
    feePercent = new Decimal(0.75); // 0.75% FX processing fee
  } else if (rateType === "provider") {
    sourceName = "Fintech & Remittance Index";
    feeFixed = baseCode === "NGN" ? new Decimal(0) : new Decimal(1.50);
    feePercent = new Decimal(0.35); // 0.35%
  }

  // Calculate pair rate (1 Base = X Target)
  const effectiveRate = activeBaseToNgn.dividedBy(activeTargetToNgn);
  const inverseRate = effectiveRate.isZero() ? new Decimal(0) : new Decimal(1).dividedBy(effectiveRate);

  // Gross amount before fees
  const grossTargetAmount = baseAmount.times(effectiveRate);

  // Total fees in base currency
  const percentFeeAmount = baseAmount.times(feePercent.dividedBy(100));
  const totalFeeInBase = baseAmount.isZero() ? new Decimal(0) : feeFixed.plus(percentFeeAmount);

  // Net converted amount
  const netBaseApplicable = Decimal.max(0, baseAmount.minus(totalFeeInBase));
  const netTargetAmount = netBaseApplicable.times(effectiveRate);

  const totalFeeInTarget = totalFeeInBase.times(effectiveRate);

  // Spread vs Official CBN
  let spreadVsOfficialPercent = new Decimal(0);
  if (!officialPairRate.isZero()) {
    spreadVsOfficialPercent = effectiveRate
      .minus(officialPairRate)
      .dividedBy(officialPairRate)
      .times(100);
  }

  // WAT Timestamp (West Africa Time is UTC+1)
  const watDateStr = getFormattedWATDate();

  return {
    baseAmount: cleanAmount,
    baseCurrency,
    targetCurrency,
    rateType,
    effectiveRate,
    inverseRate,
    grossTargetAmount,
    fixedFeeInBase: feeFixed,
    percentFee: feePercent,
    totalFeeInBase,
    totalFeeInTarget,
    netTargetAmount,
    rateSource: sourceName,
    timestampWAT: watDateStr,
    isStale: false,
    spreadVsOfficialPercent,
  };
}

/**
 * Format monetary amount strictly using Intl.NumberFormat with specified decimals
 */
export function formatCurrency(
  value: Decimal | number | string,
  currencyCode: string = "NGN",
  maxDecimals?: number
): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  const decimals = maxDecimals !== undefined ? maxDecimals : currency ? currency.decimals : 2;

  const num = typeof value === "object" && "toNumber" in value ? value.toNumber() : Number(value);

  if (isNaN(num)) return "0.00";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format high-precision FX exchange rates (up to 4 decimal places)
 */
export function formatFxRate(rate: Decimal | number): string {
  const num = typeof rate === "object" && "toNumber" in rate ? rate.toNumber() : Number(rate);
  if (num >= 100) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(num);
}

/**
 * Get current timestamp formatted in West Africa Time (WAT)
 */
export function getFormattedWATDate(): string {
  const now = new Date();
  // WAT is UTC+1
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formatted = new Intl.DateTimeFormat("en-GB", options).format(now);
  return `${formatted} WAT`;
}
