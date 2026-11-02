"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { CountryFlag } from "./Flags";

interface TickerItem {
  pair: string;
  baseCode: string;
  targetCode: string;
  officialRate: number;
  change24h: number;
}

const TICKER_DATA: TickerItem[] = [
  {
    pair: "USD/NGN",
    baseCode: "USD",
    targetCode: "NGN",
    officialRate: 1540.50,
    change24h: +0.45,
  },
  {
    pair: "GBP/NGN",
    baseCode: "GBP",
    targetCode: "NGN",
    officialRate: 1985.20,
    change24h: +0.72,
  },
  {
    pair: "EUR/NGN",
    baseCode: "EUR",
    targetCode: "NGN",
    officialRate: 1680.75,
    change24h: -0.28,
  },
  {
    pair: "CAD/NGN",
    baseCode: "CAD",
    targetCode: "NGN",
    officialRate: 1120.40,
    change24h: +0.15,
  },
  {
    pair: "XOF/NGN",
    baseCode: "XOF",
    targetCode: "NGN",
    officialRate: 2.56,
    change24h: +0.32,
  },
  {
    pair: "GHS/NGN",
    baseCode: "GHS",
    targetCode: "NGN",
    officialRate: 98.60,
    change24h: +0.95,
  },
  {
    pair: "ZAR/NGN",
    baseCode: "ZAR",
    targetCode: "NGN",
    officialRate: 86.30,
    change24h: -0.40,
  },
  {
    pair: "KES/NGN",
    baseCode: "KES",
    targetCode: "NGN",
    officialRate: 11.95,
    change24h: +0.18,
  },
  {
    pair: "JPY/NGN",
    baseCode: "JPY",
    targetCode: "NGN",
    officialRate: 10.45,
    change24h: -0.05,
  },
  {
    pair: "AUD/NGN",
    baseCode: "AUD",
    targetCode: "NGN",
    officialRate: 1015.30,
    change24h: +0.22,
  },
  {
    pair: "AED/NGN",
    baseCode: "AED",
    targetCode: "NGN",
    officialRate: 419.45,
    change24h: +0.08,
  },
  {
    pair: "CNY/NGN",
    baseCode: "CNY",
    targetCode: "NGN",
    officialRate: 215.80,
    change24h: -0.12,
  },
  {
    pair: "EGP/NGN",
    baseCode: "EGP",
    targetCode: "NGN",
    officialRate: 31.80,
    change24h: +0.64,
  },
];

export const FXTicker: React.FC = () => {
  return (
    <div className="w-full bg-slate-950 border-b border-slate-800/80 overflow-hidden py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold shrink-0 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>FX SPOT TICKER</span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-xs">
            {TICKER_DATA.map((item) => {
              const isPositive = item.change24h >= 0;
              return (
                <div
                  key={item.pair}
                  className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <CountryFlag code={item.baseCode} size={18} />
                  <span className="font-bold text-white tracking-wide">
                    {item.pair}
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">
                    ₦{item.officialRate >= 10 ? item.officialRate.toFixed(2) : item.officialRate.toFixed(3)}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 font-mono text-[11px] font-bold ${
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 stroke-[3]" />
                    )}
                    {isPositive ? "+" : ""}
                    {item.change24h.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
