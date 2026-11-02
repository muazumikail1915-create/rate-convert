export interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  decimals: number;
  category: "major" | "african" | "emerging";
}

export type RateType = "official" | "bank" | "provider";

export interface RateSource {
  id: string;
  name: string;
  type: RateType;
  logoText?: string;
  color?: string;
  buyRate: number;  // 1 Base Currency in NGN (or quote)
  sellRate: number;
  fixedFee: number;
  percentFee: number;
  deliveryTime: string;
  isPopular?: boolean;
  isBestRate?: boolean;
  lastUpdated: string;
  isStale?: boolean;
}

export interface HistoricalRatePoint {
  timestamp: string;
  date: string;
  rate: number;
  high: number;
  low: number;
  volume?: number;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  // --- Major Global Currencies ---
  {
    code: "USD",
    name: "United States Dollar",
    symbol: "$",
    country: "United States",
    countryCode: "US",
    flagEmoji: "🇺🇸",
    decimals: 2,
    category: "major",
  },
  {
    code: "GBP",
    name: "British Pound Sterling",
    symbol: "£",
    country: "United Kingdom",
    countryCode: "GB",
    flagEmoji: "🇬🇧",
    decimals: 2,
    category: "major",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    country: "European Union",
    countryCode: "EU",
    flagEmoji: "🇪🇺",
    decimals: 2,
    category: "major",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "CA$",
    country: "Canada",
    countryCode: "CA",
    flagEmoji: "🇨🇦",
    decimals: 2,
    category: "major",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    country: "Australia",
    countryCode: "AU",
    flagEmoji: "🇦🇺",
    decimals: 2,
    category: "major",
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF",
    country: "Switzerland",
    countryCode: "CH",
    flagEmoji: "🇨🇭",
    decimals: 2,
    category: "major",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    country: "Japan",
    countryCode: "JP",
    flagEmoji: "🇯🇵",
    decimals: 0,
    category: "major",
  },
  {
    code: "CNY",
    name: "Chinese Yuan Renminbi",
    symbol: "¥",
    country: "China",
    countryCode: "CN",
    flagEmoji: "🇨🇳",
    decimals: 2,
    category: "major",
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    country: "Singapore",
    countryCode: "SG",
    flagEmoji: "🇸🇬",
    decimals: 2,
    category: "major",
  },

  // --- African & Regional FX ---
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    country: "Nigeria",
    countryCode: "NG",
    flagEmoji: "🇳🇬",
    decimals: 2,
    category: "african",
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "GH₵",
    country: "Ghana",
    countryCode: "GH",
    flagEmoji: "🇬🇭",
    decimals: 2,
    category: "african",
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    country: "South Africa",
    countryCode: "ZA",
    flagEmoji: "🇿🇦",
    decimals: 2,
    category: "african",
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    country: "Kenya",
    countryCode: "KE",
    flagEmoji: "🇰🇪",
    decimals: 2,
    category: "african",
  },
  {
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "E£",
    country: "Egypt",
    countryCode: "EG",
    flagEmoji: "🇪🇬",
    decimals: 2,
    category: "african",
  },
  {
    code: "XOF",
    name: "West African CFA Franc",
    symbol: "CFA",
    country: "UEMOA (Senegal / Côte d'Ivoire)",
    countryCode: "SN",
    flagEmoji: "🇸🇳",
    decimals: 0,
    category: "african",
  },
  {
    code: "XAF",
    name: "Central African CFA Franc",
    symbol: "FCFA",
    country: "CEMAC (Cameroon / Gabon)",
    countryCode: "CM",
    flagEmoji: "🇨🇲",
    decimals: 0,
    category: "african",
  },
  {
    code: "RWF",
    name: "Rwandan Franc",
    symbol: "FRw",
    country: "Rwanda",
    countryCode: "RW",
    flagEmoji: "🇷🇼",
    decimals: 0,
    category: "african",
  },
  {
    code: "TZS",
    name: "Tanzanian Shilling",
    symbol: "TSh",
    country: "Tanzania",
    countryCode: "TZ",
    flagEmoji: "🇹🇿",
    decimals: 2,
    category: "african",
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "USh",
    country: "Uganda",
    countryCode: "UG",
    flagEmoji: "🇺🇬",
    decimals: 0,
    category: "african",
  },
  {
    code: "MAD",
    name: "Moroccan Dirham",
    symbol: "DH",
    country: "Morocco",
    countryCode: "MA",
    flagEmoji: "🇲🇦",
    decimals: 2,
    category: "african",
  },
  {
    code: "ETB",
    name: "Ethiopian Birr",
    symbol: "Br",
    country: "Ethiopia",
    countryCode: "ET",
    flagEmoji: "🇪🇹",
    decimals: 2,
    category: "african",
  },

  // --- Emerging & Middle East Markets ---
  {
    code: "AED",
    name: "UAE Dirham",
    symbol: "AED",
    country: "United Arab Emirates",
    countryCode: "AE",
    flagEmoji: "🇦🇪",
    decimals: 2,
    category: "emerging",
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    country: "India",
    countryCode: "IN",
    flagEmoji: "🇮🇳",
    decimals: 2,
    category: "emerging",
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    country: "Brazil",
    countryCode: "BR",
    flagEmoji: "🇧🇷",
    decimals: 2,
    category: "emerging",
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "SR",
    country: "Saudi Arabia",
    countryCode: "SA",
    flagEmoji: "🇸🇦",
    decimals: 2,
    category: "emerging",
  },
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    country: "Turkey",
    countryCode: "TR",
    flagEmoji: "🇹🇷",
    decimals: 2,
    category: "emerging",
  },
];

// Base Exchange Rates to NGN (Baseline USD: 1540.50 NGN)
export const BASE_RATES_TO_NGN: Record<string, { official: number; bank: number; provider: number }> = {
  // Majors
  USD: { official: 1540.50, bank: 1585.00, provider: 1610.20 },
  GBP: { official: 1985.20, bank: 2040.00, provider: 2075.50 },
  EUR: { official: 1680.75, bank: 1735.00, provider: 1762.30 },
  CAD: { official: 1120.40, bank: 1160.00, provider: 1182.00 },
  AUD: { official: 1015.30, bank: 1052.00, provider: 1070.40 },
  CHF: { official: 1760.80, bank: 1815.00, provider: 1845.00 },
  JPY: { official: 10.45, bank: 10.82, provider: 11.02 },
  CNY: { official: 215.80, bank: 224.00, provider: 228.10 },
  SGD: { official: 1180.20, bank: 1220.00, provider: 1242.50 },

  // African FX
  NGN: { official: 1.0, bank: 1.0, provider: 1.0 },
  GHS: { official: 98.60, bank: 104.50, provider: 106.80 },
  ZAR: { official: 86.30, bank: 91.20, provider: 93.40 },
  KES: { official: 11.95, bank: 12.55, provider: 12.80 },
  EGP: { official: 31.80, bank: 33.20, provider: 34.10 },
  XOF: { official: 2.56, bank: 2.65, provider: 2.72 },
  XAF: { official: 2.56, bank: 2.65, provider: 2.72 },
  RWF: { official: 1.14, bank: 1.20, provider: 1.24 },
  TZS: { official: 0.58, bank: 0.61, provider: 0.63 },
  UGX: { official: 0.42, bank: 0.44, provider: 0.46 },
  MAD: { official: 156.40, bank: 162.00, provider: 165.20 },
  ETB: { official: 13.20, bank: 13.80, provider: 14.15 },

  // Emerging & Middle East
  AED: { official: 419.45, bank: 432.00, provider: 438.50 },
  INR: { official: 18.35, bank: 19.10, provider: 19.50 },
  BRL: { official: 275.60, bank: 286.00, provider: 292.40 },
  SAR: { official: 410.80, bank: 423.50, provider: 430.00 },
  TRY: { official: 44.20, bank: 46.10, provider: 47.00 },
};

export const PROVIDER_SOURCES: RateSource[] = [
  {
    id: "cbn-nfem",
    name: "CBN Official (NFEM)",
    type: "official",
    logoText: "CBN",
    color: "#059669",
    buyRate: 1540.50,
    sellRate: 1545.00,
    fixedFee: 0.00,
    percentFee: 0.00,
    deliveryTime: "T+2 Settlement",
    isPopular: false,
    lastUpdated: "2026-09-23T14:30:00+01:00", // WAT
  },
  {
    id: "wise",
    name: "Wise (TransferWise)",
    type: "provider",
    logoText: "WISE",
    color: "#9FE870",
    buyRate: 1608.80,
    sellRate: 1618.00,
    fixedFee: 2.15, // in base currency
    percentFee: 0.45,
    deliveryTime: "Within 10 mins",
    isPopular: true,
    isBestRate: false,
    lastUpdated: "2026-09-23T15:45:00+01:00",
  },
  {
    id: "lemfi",
    name: "LemFi",
    type: "provider",
    logoText: "LEMFI",
    color: "#E2F163",
    buyRate: 1618.50,
    sellRate: 1625.00,
    fixedFee: 0.00,
    percentFee: 0.00,
    deliveryTime: "Instant (0-5 mins)",
    isPopular: true,
    isBestRate: true,
    lastUpdated: "2026-09-23T15:48:00+01:00",
  },
  {
    id: "flutterwave",
    name: "Flutterwave (Send)",
    type: "provider",
    logoText: "FLW",
    color: "#F5A623",
    buyRate: 1605.00,
    sellRate: 1614.50,
    fixedFee: 1.50,
    percentFee: 0.20,
    deliveryTime: "Instant to Bank",
    isPopular: true,
    lastUpdated: "2026-09-23T15:40:00+01:00",
  },
  {
    id: "gtbank",
    name: "GTBank (Nostro / FX Card)",
    type: "bank",
    logoText: "GTB",
    color: "#DD4F05",
    buyRate: 1585.00,
    sellRate: 1598.00,
    fixedFee: 5.00,
    percentFee: 0.75,
    deliveryTime: "Same Day / Next Day",
    lastUpdated: "2026-09-23T14:15:00+01:00",
  },
  {
    id: "access",
    name: "Access Bank",
    type: "bank",
    logoText: "ACC",
    color: "#003B70",
    buyRate: 1582.50,
    sellRate: 1595.00,
    fixedFee: 4.50,
    percentFee: 0.80,
    deliveryTime: "Same Day",
    lastUpdated: "2026-09-23T13:50:00+01:00",
  },
  {
    id: "zenith",
    name: "Zenith Bank",
    type: "bank",
    logoText: "ZEN",
    color: "#C5091C",
    buyRate: 1588.00,
    sellRate: 1600.00,
    fixedFee: 5.00,
    percentFee: 0.70,
    deliveryTime: "Same Day",
    lastUpdated: "2026-09-23T14:00:00+01:00",
  },
  {
    id: "sendwave",
    name: "Sendwave",
    type: "provider",
    logoText: "WAVE",
    color: "#1CB0F6",
    buyRate: 1600.00,
    sellRate: 1610.00,
    fixedFee: 0.00,
    percentFee: 0.50,
    deliveryTime: "Instant to Mobile Money/Bank",
    lastUpdated: "2026-09-23T15:30:00+01:00",
  }
];

export interface MarketMetrics {
  cbnRate: number;
  cbnChange24h: number;
  parallelMidRate: number;
  parallelChange24h: number;
  spreadPercent: number;
  turnover24hUsd: string;
  marketStatus: "OPEN" | "CLOSED";
  marketSession: string;
  nextSessionTime: string;
}

export const CURRENT_MARKET_METRICS: MarketMetrics = {
  cbnRate: 1540.50,
  cbnChange24h: -0.35,
  parallelMidRate: 1615.00,
  parallelChange24h: +0.62,
  spreadPercent: 4.83,
  turnover24hUsd: "$142.8M",
  marketStatus: "OPEN",
  marketSession: "NFEM Active Trading Window (09:00 - 16:30 WAT)",
  nextSessionTime: "Closing at 16:30 WAT",
};

// Realistic historical rate generator for USD/NGN and cross-currencies
export function generateHistoricalData(
  baseCode: string,
  targetCode: string,
  timeframe: "24H" | "7D" | "30D" | "90D" | "1Y",
  rateType: RateType = "official"
): HistoricalRatePoint[] {
  const baseRateObj = BASE_RATES_TO_NGN[baseCode] || { official: 1, bank: 1, provider: 1 };
  const targetRateObj = BASE_RATES_TO_NGN[targetCode] || { official: 1, bank: 1, provider: 1 };

  const baseInNgn = baseRateObj[rateType] || baseRateObj.official;
  const targetInNgn = targetRateObj[rateType] || targetRateObj.official;
  const currentPairRate = baseInNgn / targetInNgn;

  const points: HistoricalRatePoint[] = [];
  let count = 24;
  let intervalHours = 1;

  if (timeframe === "24H") {
    count = 24;
    intervalHours = 1;
  } else if (timeframe === "7D") {
    count = 14;
    intervalHours = 12;
  } else if (timeframe === "30D") {
    count = 30;
    intervalHours = 24;
  } else if (timeframe === "90D") {
    count = 30;
    intervalHours = 72;
  } else if (timeframe === "1Y") {
    count = 52;
    intervalHours = 168;
  }

  const now = new Date(2026, 8, 23, 15, 50, 0);
  const volatility = timeframe === "24H" ? 0.004 : timeframe === "7D" ? 0.012 : timeframe === "30D" ? 0.028 : 0.065;

  for (let i = count - 1; i >= 0; i--) {
    const pointDate = new Date(now.getTime() - i * intervalHours * 60 * 60 * 1000);
    const progress = (count - i) / count;
    
    const wave = Math.sin(i * 0.45) * volatility * currentPairRate;
    const microTrend = (progress - 0.5) * volatility * currentPairRate * 0.4;
    
    const calculatedRate = Number((currentPairRate + wave + microTrend).toFixed(4));
    const high = Number((calculatedRate * (1 + 0.002)).toFixed(4));
    const low = Number((calculatedRate * (1 - 0.002)).toFixed(4));

    let timeLabel = "";
    if (timeframe === "24H") {
      timeLabel = pointDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    } else if (timeframe === "7D" || timeframe === "30D") {
      timeLabel = pointDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      timeLabel = pointDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
    }

    points.push({
      timestamp: pointDate.toISOString(),
      date: timeLabel,
      rate: calculatedRate,
      high,
      low,
      volume: Math.floor(100000 + Math.random() * 500000),
    });
  }

  if (points.length > 0) {
    points[points.length - 1].rate = Number(currentPairRate.toFixed(4));
    points[points.length - 1].high = Number((currentPairRate * 1.001).toFixed(4));
    points[points.length - 1].low = Number((currentPairRate * 0.999).toFixed(4));
  }

  return points;
}
