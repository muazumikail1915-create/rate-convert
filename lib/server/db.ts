import {
  DBCurrency,
  DBRateSource,
  DBExchangeRate,
  DBHistoricalRate,
  DBRateAlert,
  DBMarketSession,
} from "./types";
import {
  SUPPORTED_CURRENCIES,
  PROVIDER_SOURCES,
  BASE_RATES_TO_NGN,
  CURRENT_MARKET_METRICS,
  generateHistoricalData,
} from "../mock-rates";

class DatabaseRepository {
  private currencies: Map<string, DBCurrency> = new Map();
  private rateSources: Map<string, DBRateSource> = new Map();
  private exchangeRates: DBExchangeRate[] = [];
  private rateAlerts: Map<string, DBRateAlert> = new Map();
  private marketSession: DBMarketSession;

  constructor() {
    // Seed Currencies
    SUPPORTED_CURRENCIES.forEach((c) => {
      this.currencies.set(c.code, {
        id: `curr_${c.code.toLowerCase()}`,
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        country: c.country,
        countryCode: c.countryCode,
        flagEmoji: c.flagEmoji,
        decimals: c.decimals,
        category: c.category,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Seed Rate Sources
    PROVIDER_SOURCES.forEach((s) => {
      this.rateSources.set(s.id, {
        id: s.id,
        name: s.name,
        type: s.type,
        logoText: s.logoText || s.name.slice(0, 3).toUpperCase(),
        color: s.color || "#334155",
        isActive: true,
        deliverySpeed: s.deliveryTime,
        fixedFee: s.fixedFee,
        percentFee: s.percentFee,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Seed Initial Exchange Rates
    Object.keys(BASE_RATES_TO_NGN).forEach((baseCode) => {
      const rateObj = BASE_RATES_TO_NGN[baseCode];
      PROVIDER_SOURCES.forEach((source) => {
        const rateVal = rateObj[source.type] || rateObj.official;
        this.exchangeRates.push({
          id: `rate_${source.id}_${baseCode}_NGN`,
          sourceId: source.id,
          baseCurrencyCode: baseCode,
          targetCurrencyCode: "NGN",
          buyRate: rateVal,
          sellRate: Number((rateVal * 1.004).toFixed(4)),
          midRate: Number((rateVal * 1.002).toFixed(4)),
          fixedFee: source.fixedFee,
          percentFee: source.percentFee,
          isStale: false,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      });
    });

    // Seed Market Session
    this.marketSession = {
      id: "nfem-window",
      name: CURRENT_MARKET_METRICS.marketSession,
      openTimeWAT: "09:00",
      closeTimeWAT: "16:30",
      status: CURRENT_MARKET_METRICS.marketStatus,
      cbnRate: CURRENT_MARKET_METRICS.cbnRate,
      cbnChange24h: CURRENT_MARKET_METRICS.cbnChange24h,
      parallelMidRate: CURRENT_MARKET_METRICS.parallelMidRate,
      parallelChange24h: CURRENT_MARKET_METRICS.parallelChange24h,
      spreadPercent: CURRENT_MARKET_METRICS.spreadPercent,
      turnover24hUsd: CURRENT_MARKET_METRICS.turnover24hUsd,
      lastUpdatedWAT: new Date().toISOString(),
    };
  }

  // --- Currency Operations ---
  public getCurrencies(category?: string): DBCurrency[] {
    const list = Array.from(this.currencies.values()).filter((c) => c.isActive);
    if (category && category !== "all") {
      return list.filter((c) => c.category === category);
    }
    return list;
  }

  public getCurrencyByCode(code: string): DBCurrency | undefined {
    return this.currencies.get(code.toUpperCase());
  }

  // --- Rate Source Operations ---
  public getRateSources(type?: string): DBRateSource[] {
    const list = Array.from(this.rateSources.values()).filter((s) => s.isActive);
    if (type && type !== "all") {
      return list.filter((s) => s.type === type);
    }
    return list;
  }

  // --- Exchange Rate Operations ---
  public getExchangeRates(baseCode: string, targetCode: string): DBExchangeRate[] {
    const base = baseCode.toUpperCase();
    const target = targetCode.toUpperCase();

    const baseObj = BASE_RATES_TO_NGN[base] || { official: 1, bank: 1, provider: 1 };
    const targetObj = BASE_RATES_TO_NGN[target] || { official: 1, bank: 1, provider: 1 };

    return Array.from(this.rateSources.values()).map((source) => {
      const rateKey = (source.type === "bank" ? "bank" : source.type === "official" ? "official" : "provider") as "official" | "bank" | "provider";
      const baseInNgn = baseObj[rateKey] || baseObj.official;
      const targetInNgn = targetObj[rateKey] || targetObj.official;
      const pairRate = baseInNgn / targetInNgn;

      return {
        id: `rate_${source.id}_${base}_${target}`,
        sourceId: source.id,
        baseCurrencyCode: base,
        targetCurrencyCode: target,
        buyRate: Number(pairRate.toFixed(4)),
        sellRate: Number((pairRate * 1.004).toFixed(4)),
        midRate: Number((pairRate * 1.002).toFixed(4)),
        fixedFee: source.fixedFee,
        percentFee: source.percentFee,
        isStale: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    });
  }

  // --- Historical Rate Operations ---
  public getHistoricalRates(
    baseCode: string,
    targetCode: string,
    timeframe: "24H" | "7D" | "30D" | "90D" | "1Y"
  ): DBHistoricalRate[] {
    const points = generateHistoricalData(baseCode, targetCode, timeframe, "official");
    return points.map((p, idx) => ({
      id: `hist_${baseCode}_${targetCode}_${timeframe}_${idx}`,
      pair: `${baseCode}_${targetCode}`,
      timeframe,
      rate: p.rate,
      high: p.high,
      low: p.low,
      volume: p.volume || 150000,
      timestamp: p.timestamp,
    }));
  }

  // --- Rate Alert Operations ---
  public createAlert(alert: Omit<DBRateAlert, "id" | "createdAt" | "status">): DBRateAlert {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAlert: DBRateAlert = {
      ...alert,
      id,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    this.rateAlerts.set(id, newAlert);
    return newAlert;
  }

  public getAlertsByUser(userContact: string): DBRateAlert[] {
    return Array.from(this.rateAlerts.values()).filter(
      (a) => a.userContact.toLowerCase() === userContact.toLowerCase()
    );
  }

  // --- Market Session Operations ---
  public getMarketSession(): DBMarketSession {
    return {
      ...this.marketSession,
      lastUpdatedWAT: new Date().toISOString(),
    };
  }
}

// Global Singleton Instance for Next.js API Routes
const globalForDb = global as unknown as { dbRepo: DatabaseRepository };
export const db = globalForDb.dbRepo || new DatabaseRepository();
if (process.env.NODE_ENV !== "production") globalForDb.dbRepo = db;
