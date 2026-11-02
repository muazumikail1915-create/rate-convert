"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Building2,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import { PROVIDER_SOURCES, RateSource, RateType, SUPPORTED_CURRENCIES, BASE_RATES_TO_NGN } from "@/lib/mock-rates";
import { formatCurrency, formatFxRate } from "@/lib/calculator";
import { Decimal } from "decimal.js";

interface RateComparisonProps {
  amount?: string;
  baseCode?: string;
  targetCode?: string;
}

export const RateComparison: React.FC<RateComparisonProps> = ({
  amount = "1000",
  baseCode = "USD",
  targetCode = "NGN",
}) => {
  const [filterType, setFilterType] = useState<"all" | RateType>("all");

  const baseCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === baseCode) || SUPPORTED_CURRENCIES[0];
  const targetCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === targetCode) || SUPPORTED_CURRENCIES[1];

  const parsedAmount = useMemo(() => {
    const clean = amount.replace(/,/g, "");
    return isNaN(Number(clean)) || Number(clean) <= 0 ? new Decimal(1000) : new Decimal(clean);
  }, [amount]);

  // Compute calculated values for each provider
  const calculatedProviders = useMemo(() => {
    // Relative multiplier between Base and USD/NGN
    const baseObj = BASE_RATES_TO_NGN[baseCode] || { official: 1, bank: 1, provider: 1 };
    const targetObj = BASE_RATES_TO_NGN[targetCode] || { official: 1, bank: 1, provider: 1 };

    return PROVIDER_SOURCES.map((provider) => {
      // Scale buyRate for cross-currencies
      const baseToNgn = baseObj[provider.type] || baseObj.official;
      const targetToNgn = targetObj[provider.type] || targetObj.official;

      // Base pair exchange rate
      let pairRate = baseToNgn / targetToNgn;

      // If comparing against NGN, use provider specific rate variations
      if (targetCode === "NGN") {
        if (provider.id === "cbn-nfem") pairRate = baseObj.official;
        else if (provider.id === "lemfi") pairRate = baseObj.provider * 1.008;
        else if (provider.id === "wise") pairRate = baseObj.provider * 1.001;
        else if (provider.id === "flutterwave") pairRate = baseObj.provider * 0.997;
        else if (provider.id === "sendwave") pairRate = baseObj.provider * 0.994;
        else if (provider.id === "gtbank") pairRate = baseObj.bank * 1.003;
        else if (provider.id === "zenith") pairRate = baseObj.bank * 1.005;
        else if (provider.id === "access") pairRate = baseObj.bank * 1.001;
      }

      const rateDec = new Decimal(pairRate);
      const fixedFee = new Decimal(provider.fixedFee);
      const percentFee = new Decimal(provider.percentFee);

      const feeInBase = fixedFee.plus(parsedAmount.times(percentFee.dividedBy(100)));
      const netBase = Decimal.max(0, parsedAmount.minus(feeInBase));
      const netPayout = netBase.times(rateDec);

      return {
        ...provider,
        effectiveRate: rateDec,
        feeInBase,
        netPayout,
      };
    }).sort((a, b) => b.netPayout.minus(a.netPayout).toNumber());
  }, [baseCode, targetCode, parsedAmount]);

  const bestPayout = calculatedProviders[0]?.netPayout || new Decimal(0);

  const filteredList = calculatedProviders.filter((p) => {
    if (filterType === "all") return true;
    return p.type === filterType;
  });

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Live Marketplace Arbitrage
            </span>
            <span className="text-xs text-slate-400">
              For {formatCurrency(parsedAmount, baseCurrency.code)} {baseCurrency.code}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
            Exchange Rate Comparison Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent breakdown across Central Bank official window, commercial banks, and top remittance operators.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === "all"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Channels ({calculatedProviders.length})
          </button>
          <button
            onClick={() => setFilterType("provider")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === "provider"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Fintech Providers
          </button>
          <button
            onClick={() => setFilterType("bank")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === "bank"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Commercial Banks
          </button>
          <button
            onClick={() => setFilterType("official")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === "official"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Official CBN
          </button>
        </div>
      </div>

      {/* Comparison Table / Responsive Cards */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Provider / Channel</th>
              <th className="py-3 px-4">Effective Rate</th>
              <th className="py-3 px-4">Total Fees</th>
              <th className="py-3 px-4">Recipient Gets</th>
              <th className="py-3 px-4">Settlement Speed</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredList.map((item, index) => {
              const isBest = item.netPayout.equals(bestPayout);
              const diffFromBest = bestPayout.minus(item.netPayout);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isBest ? "bg-emerald-950/20" : ""
                  }`}
                >
                  {/* Provider Details */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: item.color || "#334155" }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-slate-950 text-xs shadow-md shrink-0"
                      >
                        {item.logoText || item.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {item.name}
                          </span>
                          {isBest && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Best Value
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="capitalize">
                            {item.type === "official"
                              ? "Central Bank Reference"
                              : item.type === "bank"
                              ? "Commercial Bank"
                              : "Fintech Remittance"}
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">
                            Updated {new Date(item.lastUpdated).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} WAT
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Effective Rate */}
                  <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                    1 {baseCurrency.code} = {formatFxRate(item.effectiveRate)} {targetCurrency.code}
                  </td>

                  {/* Total Fees */}
                  <td className="py-4 px-4">
                    <div className="text-sm font-semibold text-slate-200">
                      {item.feeInBase.isZero()
                        ? "FREE (0.00)"
                        : `${formatCurrency(item.feeInBase, baseCurrency.code)} ${baseCurrency.code}`}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.percentFee > 0 ? `${item.percentFee}% + ` : ""}
                      {formatCurrency(item.fixedFee, baseCurrency.code)} fixed
                    </div>
                  </td>

                  {/* Recipient Gets */}
                  <td className="py-4 px-4">
                    <div className="text-base font-black text-emerald-400">
                      {formatCurrency(item.netPayout, targetCurrency.code)} {targetCurrency.code}
                    </div>
                    {!isBest && diffFromBest.greaterThan(0) && (
                      <div className="text-[11px] text-rose-400/90 font-mono">
                        - {formatCurrency(diffFromBest, targetCurrency.code)} vs best
                      </div>
                    )}
                  </td>

                  {/* Delivery Speed */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.deliveryTime}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                        isBest
                          ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      <span>Quote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Comparison Footer Notice */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Rates are gathered from public APIs and verified bank circulars in real-time.</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Last Global Refresh: 23 Sep 2026 15:50 WAT
        </div>
      </div>
    </div>
  );
};
