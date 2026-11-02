"use client";

import React from "react";
import {
  TrendingUp,
  BarChart3,
  ShieldAlert,
  Coins,
  Layers,
  Info,
  ExternalLink,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { CURRENT_MARKET_METRICS } from "@/lib/mock-rates";

export const MarketIntelligence: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Institutional Macro Data
            </span>
            <span className="text-xs text-slate-400">Nigeria FX Architecture</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
            NFEM Market Intelligence & Liquidity Overview
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics on official central bank windows, parallel market premiums, and interbank turnover.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <span className="text-slate-500">24H Turnover:</span>{" "}
          <strong className="text-emerald-400">{CURRENT_MARKET_METRICS.turnover24hUsd}</strong>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {/* Card 1: Official Window (NFEM) */}
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Official NFEM Window</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CBN Fixed/Floating
            </span>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-black text-white">
              ₦{CURRENT_MARKET_METRICS.cbnRate.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Weighted Average rate determined by autonomous market forces via FMDQ OTC Exchange.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Trading Band: ₦1,530 - ₦1,560</span>
            <span className="text-emerald-400 font-semibold">Regulated</span>
          </div>
        </div>

        {/* Card 2: Parallel Market & Spread */}
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Market / Fintech Spread</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {CURRENT_MARKET_METRICS.spreadPercent}% Premium
            </span>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-black text-amber-300">
              ₦{CURRENT_MARKET_METRICS.parallelMidRate.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Average open market and international remittance clearing rate across retail corridors.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Spread Gap: ₦{(CURRENT_MARKET_METRICS.parallelMidRate - CURRENT_MARKET_METRICS.cbnRate).toFixed(2)}</span>
            <span className="text-amber-400 font-semibold">Low Distortion</span>
          </div>
        </div>

        {/* Card 3: Commercial Bank FX Limits */}
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Commercial Bank Limits</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Card & PTA Policy
            </span>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-black text-blue-300">
              $20 - $100 / Mo
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Standard Naira debit card spend limits on international websites; FX cards operate without cap.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Settlement: Instant / T+1</span>
            <span className="text-blue-400 font-semibold">Interbank</span>
          </div>
        </div>
      </div>
    </div>
  );
};
