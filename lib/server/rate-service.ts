import { db } from "./db";
import { Decimal } from "decimal.js";
import { RateType } from "../mock-rates";

// Configure high-precision Decimal arithmetic
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface ConvertRequest {
  amount: string;
  from: string;
  to: string;
  type?: RateType;
  sourceId?: string;
}

export interface ConvertResponse {
  baseAmount: string;
  baseCurrency: {
    code: string;
    name: string;
    symbol: string;
  };
  targetCurrency: {
    code: string;
    name: string;
    symbol: string;
  };
  rateType: string;
  effectiveRate: number;
  inverseRate: number;
  grossAmount: number;
  totalFeeInBase: number;
  totalFeeInTarget: number;
  netAmount: number;
  rateSource: string;
  timestampWAT: string;
  isStale: boolean;
}

export interface CompareItem {
  id: string;
  name: string;
  type: string;
  logoText: string;
  color: string;
  effectiveRate: number;
  feeInBase: number;
  netPayout: number;
  deliveryTime: string;
  isBestValue: boolean;
  diffFromBest: number;
  lastUpdated: string;
}

export class RateService {
  public static async getCurrencies(category?: string) {
    return db.getCurrencies(category);
  }

  public static async getLatestRates(baseCode = "USD", targetCode = "NGN") {
    const base = baseCode.toUpperCase();
    const target = targetCode.toUpperCase();

    const baseCurr = db.getCurrencyByCode(base);
    const targetCurr = db.getCurrencyByCode(target);

    if (!baseCurr || !targetCurr) {
      throw new Error(`Unsupported currency pair: ${base}/${target}`);
    }

    const rates = db.getExchangeRates(base, target);
    const sources = db.getRateSources();

    const formattedRates = rates.map((r) => {
      const source = sources.find((s) => s.id === r.sourceId);
      return {
        sourceId: r.sourceId,
        sourceName: source ? source.name : r.sourceId,
        sourceType: source ? source.type : "official",
        buyRate: r.buyRate,
        sellRate: r.sellRate,
        midRate: r.midRate,
        fixedFee: r.fixedFee,
        percentFee: r.percentFee,
        isStale: r.isStale,
        timestamp: r.timestamp,
      };
    });

    return {
      pair: `${base}/${target}`,
      baseCurrency: baseCurr,
      targetCurrency: targetCurr,
      rates: formattedRates,
      timestamp: new Date().toISOString(),
    };
  }

  public static async convert(req: ConvertRequest): Promise<ConvertResponse> {
    const fromCode = req.from.toUpperCase();
    const toCode = req.to.toUpperCase();
    const rateType = req.type || "official";

    const baseCurr = db.getCurrencyByCode(fromCode);
    const targetCurr = db.getCurrencyByCode(toCode);

    if (!baseCurr || !targetCurr) {
      throw new Error(`Invalid currency code: ${fromCode} or ${toCode}`);
    }

    let cleanAmount = (req.amount || "0").trim().replace(/,/g, "");
    if (isNaN(Number(cleanAmount)) || Number(cleanAmount) < 0) {
      cleanAmount = "0";
    }

    const baseAmountDec = new Decimal(cleanAmount);
    const rates = db.getExchangeRates(fromCode, toCode);
    const selectedRate = rates.find((r) => {
      const source = db.getRateSources().find((s) => s.id === r.sourceId);
      return source?.type === rateType;
    }) || rates[0];

    const rateDec = new Decimal(selectedRate.buyRate);
    const inverseDec = rateDec.isZero() ? new Decimal(0) : new Decimal(1).dividedBy(rateDec);

    let feeFixed = new Decimal(selectedRate.fixedFee);
    let feePercent = new Decimal(selectedRate.percentFee);

    if (rateType === "bank") {
      feeFixed = fromCode === "NGN" ? new Decimal(500) : new Decimal(4.50);
      feePercent = new Decimal(0.75);
    } else if (rateType === "provider") {
      feeFixed = fromCode === "NGN" ? new Decimal(0) : new Decimal(1.50);
      feePercent = new Decimal(0.35);
    } else {
      feeFixed = new Decimal(0);
      feePercent = new Decimal(0);
    }

    const grossTarget = baseAmountDec.times(rateDec);
    const percentFeeInBase = baseAmountDec.times(feePercent.dividedBy(100));
    const totalFeeInBase = baseAmountDec.isZero() ? new Decimal(0) : feeFixed.plus(percentFeeInBase);

    const netBase = Decimal.max(0, baseAmountDec.minus(totalFeeInBase));
    const netTarget = netBase.times(rateDec);
    const totalFeeInTarget = totalFeeInBase.times(rateDec);

    const sourceObj = db.getRateSources().find((s) => s.id === selectedRate.sourceId);

    return {
      baseAmount: cleanAmount,
      baseCurrency: {
        code: baseCurr.code,
        name: baseCurr.name,
        symbol: baseCurr.symbol,
      },
      targetCurrency: {
        code: targetCurr.code,
        name: targetCurr.name,
        symbol: targetCurr.symbol,
      },
      rateType,
      effectiveRate: rateDec.toNumber(),
      inverseRate: inverseDec.toNumber(),
      grossAmount: grossTarget.toNumber(),
      totalFeeInBase: totalFeeInBase.toNumber(),
      totalFeeInTarget: totalFeeInTarget.toNumber(),
      netAmount: netTarget.toNumber(),
      rateSource: sourceObj ? sourceObj.name : "Central Bank of Nigeria (NFEM)",
      timestampWAT: new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Lagos" }) + " WAT",
      isStale: false,
    };
  }

  public static async compare(amountStr = "1000", fromCode = "USD", toCode = "NGN"): Promise<CompareItem[]> {
    const from = fromCode.toUpperCase();
    const to = toCode.toUpperCase();
    const cleanAmount = isNaN(Number(amountStr)) || Number(amountStr) <= 0 ? "1000" : amountStr;
    const amountDec = new Decimal(cleanAmount);

    const rates = db.getExchangeRates(from, to);
    const sources = db.getRateSources();

    const results = rates.map((r) => {
      const source = sources.find((s) => s.id === r.sourceId);
      const rateDec = new Decimal(r.buyRate);
      const fixedFee = new Decimal(r.fixedFee);
      const percentFee = new Decimal(r.percentFee);

      const feeInBase = fixedFee.plus(amountDec.times(percentFee.dividedBy(100)));
      const netBase = Decimal.max(0, amountDec.minus(feeInBase));
      const netPayout = netBase.times(rateDec);

      return {
        id: r.sourceId,
        name: source ? source.name : r.sourceId,
        type: source ? source.type : "provider",
        logoText: source?.logoText || r.sourceId.toUpperCase(),
        color: source?.color || "#334155",
        effectiveRate: rateDec.toNumber(),
        feeInBase: feeInBase.toNumber(),
        netPayout: netPayout.toNumber(),
        deliveryTime: source?.deliverySpeed || "Instant",
        isBestValue: false,
        diffFromBest: 0,
        lastUpdated: r.timestamp,
      };
    }).sort((a, b) => b.netPayout - a.netPayout);

    const bestPayout = results[0]?.netPayout || 0;
    return results.map((item) => ({
      ...item,
      isBestValue: item.netPayout === bestPayout,
      diffFromBest: Number((bestPayout - item.netPayout).toFixed(2)),
    }));
  }

  public static async getHistorical(baseCode = "USD", targetCode = "NGN", timeframe: "24H" | "7D" | "30D" | "90D" | "1Y" = "30D") {
    return db.getHistoricalRates(baseCode.toUpperCase(), targetCode.toUpperCase(), timeframe);
  }

  public static async getMarketStatus() {
    return db.getMarketSession();
  }

  public static async createAlert(userContact: string, baseCurrency: string, targetCurrency: string, targetRate: number, direction: "ABOVE" | "BELOW") {
    return db.createAlert({
      userContact,
      baseCurrency: baseCurrency.toUpperCase(),
      targetCurrency: targetCurrency.toUpperCase(),
      targetRate,
      direction,
    });
  }

  public static async getAlerts(userContact: string) {
    return db.getAlertsByUser(userContact);
  }
}
