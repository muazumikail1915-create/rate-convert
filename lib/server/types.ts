export interface DBCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  decimals: number;
  category: "major" | "african" | "emerging";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RateSourceType = "official" | "bank" | "provider" | "parallel";

export interface DBRateSource {
  id: string;
  name: string;
  type: RateSourceType;
  logoText: string;
  color: string;
  isActive: boolean;
  deliverySpeed: string;
  fixedFee: number;
  percentFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBExchangeRate {
  id: string;
  sourceId: string;
  baseCurrencyCode: string;
  targetCurrencyCode: string;
  buyRate: number;
  sellRate: number;
  midRate: number;
  fixedFee: number;
  percentFee: number;
  isStale: boolean;
  timestamp: string;
  createdAt: string;
}

export interface DBHistoricalRate {
  id: string;
  pair: string;
  timeframe: "24H" | "7D" | "30D" | "90D" | "1Y";
  rate: number;
  high: number;
  low: number;
  volume: number;
  timestamp: string;
}

export interface DBRateAlert {
  id: string;
  userContact: string;
  baseCurrency: string;
  targetCurrency: string;
  targetRate: number;
  direction: "ABOVE" | "BELOW";
  status: "ACTIVE" | "TRIGGERED" | "EXPIRED";
  createdAt: string;
  triggeredAt?: string;
}

export interface DBMarketSession {
  id: string;
  name: string;
  openTimeWAT: string;
  closeTimeWAT: string;
  status: "OPEN" | "CLOSED" | "HOLIDAY";
  cbnRate: number;
  cbnChange24h: number;
  parallelMidRate: number;
  parallelChange24h: number;
  spreadPercent: number;
  turnover24hUsd: string;
  lastUpdatedWAT: string;
}
