"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpDown,
  TrendingUp,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  Building2,
  Zap,
  RefreshCw,
  Sparkles,
  Bell,
} from "lucide-react";
import { Currency, RateType } from "@/lib/mock-rates";
import { calculateConversion, formatCurrency, formatFxRate } from "@/lib/calculator";
import { CountryFlag } from "./Flags";
import { CurrencyModal } from "./CurrencyModal";
import { AlertModal } from "./AlertModal";

export interface ConverterProps {
  initialBase?: string;
  initialTarget?: string;
  onCurrencyChange?: (base: string, target: string, rateType: RateType) => void;
}

export function Converter({
  initialBase = "USD",
  initialTarget = "NGN",
  onCurrencyChange,
}: ConverterProps) {
  const [baseAmount, setBaseAmount] = useState<string>("1000");
  const [baseCode, setBaseCode] = useState<string>(initialBase);
  const [targetCode, setTargetCode] = useState<string>(initialTarget);
  const [rateType, setRateType] = useState<RateType>("official");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [isStaleManual, setIsStaleManual] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"base" | "target" | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [recentCodes, setRecentCodes] = useState<string[]>([
    "USD",
    "NGN",
    "GBP",
    "EUR",
    "CAD",
    "XOF",
    "GHS",
    "KES",
    "JPY",
  ]);

  // Calculate live conversion values via Decimal.js numerical engine
  const calculation = useMemo(() => {
    const calc = calculateConversion(baseAmount, baseCode, targetCode, rateType);
    calc.isStale = isStaleManual;
    return calc;
  }, [baseAmount, baseCode, targetCode, rateType, isStaleManual]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^0-9.]/g, "");

    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }

    setBaseAmount(val);
  };

  const handleQuickAmount = (val: string) => {
    setBaseAmount(val);
  };

  const handleSwap = () => {
    setIsSwapping(true);
    const prevBase = baseCode;
    const prevTarget = targetCode;
    setBaseCode(prevTarget);
    setTargetCode(prevBase);
    onCurrencyChange?.(prevTarget, prevBase, rateType);

    setTimeout(() => {
      setIsSwapping(false);
    }, 400);
  };

  const handleSelectCurrency = (currency: Currency) => {
    if (modalType === "base") {
      if (currency.code === targetCode) {
        setTargetCode(baseCode);
      }
      setBaseCode(currency.code);
      onCurrencyChange?.(currency.code, targetCode, rateType);
    } else if (modalType === "target") {
      if (currency.code === baseCode) {
        setBaseCode(targetCode);
      }
      setTargetCode(currency.code);
      onCurrencyChange?.(baseCode, currency.code, rateType);
    }

    setRecentCodes((prev) => {
      const filtered = prev.filter((c) => c !== currency.code);
      return [currency.code, ...filtered].slice(0, 8);
    });
  };

  const handleRateTypeChange = (newType: RateType) => {
    setRateType(newType);
    onCurrencyChange?.(baseCode, targetCode, newType);
  };

  const baseCurrency = calculation.baseCurrency;
  const targetCurrency = calculation.targetCurrency;

  const quickPresets =
    baseCode === "NGN"
      ? ["50000", "100000", "500000", "1000000", "5000000"]
      : ["100", "500", "1000", "2500", "5000", "10000"];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Rate Type Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live FX Intelligence
            </span>
            <span className="text-xs text-slate-400">26 Global &amp; African Corridors</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
            Currency Exchange Calculator
          </h2>
        </div>

        {/* Rate Type Pill Switcher */}
        <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleRateTypeChange("official")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              rateType === "official"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official NFEM</span>
          </button>

          <button
            type="button"
            onClick={() => handleRateTypeChange("bank")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              rateType === "bank"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank Rate</span>
          </button>

          <button
            type="button"
            onClick={() => handleRateTypeChange("provider")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              rateType === "provider"
                ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-900/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Provider Rate</span>
          </button>
        </div>
      </div>

      {/* Stale Warning Banner (if simulated or triggered) */}
      {calculation.isStale && (
        <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-amber-300 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Market Caution:</strong> Live provider feed delayed by &gt;15 minutes. Quotes shown are last-known indicative closing rates.
            </span>
          </div>
          <button
            onClick={() => setIsStaleManual(false)}
            className="text-xs underline hover:text-amber-100 shrink-0"
          >
            Refresh Feed
          </button>
        </div>
      )}

      {/* Converter Inputs Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* Base Currency Card */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 sm:p-5 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="base-amount-input" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              You Send / Base Amount
            </label>
            <span className="text-xs text-slate-400 font-mono">
              Balance Free Quote
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              id="base-amount-input"
              type="text"
              inputMode="decimal"
              value={baseAmount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder-slate-400 focus:outline-none tracking-tight"
              aria-label="Amount to convert"
            />

            {/* Currency Selector Trigger */}
            <button
              type="button"
              onClick={() => setModalType("base")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white font-semibold transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
              aria-label={`Select base currency, currently ${baseCurrency.code}`}
            >
              <CountryFlag code={baseCurrency.code} size={22} />
              <span className="text-base font-bold">{baseCurrency.code}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">▼</span>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{baseCurrency.name}</span>
            <span>Symbol: {baseCurrency.symbol}</span>
          </div>
        </div>

        {/* Currency Swap Button */}
        <div className="lg:col-span-1 flex justify-center my-1 lg:my-0">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap base and target currencies"
            className={`w-12 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all transform duration-300 ${
              isSwapping ? "rotate-180 scale-110" : "hover:scale-105 active:scale-95"
            }`}
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>

        {/* Target Currency Card */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 sm:p-5 focus-within:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Recipient Gets / Estimated Output
            </label>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Net Payout
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-full text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight truncate">
              {formatCurrency(calculation.netTargetAmount, targetCurrency.code)}
            </div>

            {/* Currency Selector Trigger */}
            <button
              type="button"
              onClick={() => setModalType("target")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-white font-semibold transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
              aria-label={`Select target currency, currently ${targetCurrency.code}`}
            >
              <CountryFlag code={targetCurrency.code} size={22} />
              <span className="text-base font-bold">{targetCurrency.code}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">▼</span>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{targetCurrency.name}</span>
            <span>Gross: {formatCurrency(calculation.grossTargetAmount, targetCurrency.code)}</span>
          </div>
        </div>
      </div>

      {/* Quick Amount Chips & Rate Alert Button */}
      <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Presets:
          </span>
          {quickPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleQuickAmount(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                baseAmount === preset
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50"
              }`}
            >
              {baseCurrency.symbol}
              {Number(preset) >= 1000 ? `${(Number(preset) / 1000).toLocaleString()}k` : preset}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsAlertModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold shrink-0 transition-all"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Set Alert</span>
        </button>
      </div>

      {/* Dynamic Breakdown & Financial Detail Card */}
      <div className="mt-6 p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/70">
          {/* Rate Summary */}
          <div className="space-y-1.5 md:pr-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Effective Exchange Rate</span>
            </div>
            <div className="text-base font-bold text-white tracking-wide">
              1 {baseCurrency.code} = {formatFxRate(calculation.effectiveRate)} {targetCurrency.code}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Inverse: 1 {targetCurrency.code} = {formatFxRate(calculation.inverseRate)} {baseCurrency.code}
            </div>
          </div>

          {/* Fee & Deduction Breakdown */}
          <div className="space-y-1.5 pt-3 md:pt-0 md:px-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Estimated Fees &amp; Deductions</span>
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {calculation.percentFee.toString()}% + {formatCurrency(calculation.fixedFeeInBase, baseCurrency.code)}
              </span>
            </div>
            <div className="text-base font-bold text-slate-200">
              - {formatCurrency(calculation.totalFeeInBase, baseCurrency.code)} {baseCurrency.code}
              <span className="text-xs text-slate-400 font-normal ml-1">
                (~{formatCurrency(calculation.totalFeeInTarget, targetCurrency.code)} {targetCurrency.code})
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              {rateType === "official" ? "0% CBN NFEM processing surcharge" : "Competitive interbank spread applied"}
            </div>
          </div>

          {/* Rate Provider & Timestamp (WAT) */}
          <div className="space-y-1.5 pt-3 md:pt-0 md:pl-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Source Benchmark</span>
              </span>
              <button
                onClick={() => setIsStaleManual(!isStaleManual)}
                title="Simulate live vs stale quote data"
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isStaleManual ? "Stale Active" : "Simulate Stale"}</span>
              </button>
            </div>
            <div className="text-sm font-semibold text-slate-200 truncate">
              {calculation.rateSource}
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span>{calculation.timestampWAT}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="mt-4 px-4 py-2.5 bg-slate-950/40 border border-slate-800/40 rounded-xl text-center">
        <p className="text-xs text-slate-400 italic">
          &ldquo;Results are estimates based on prevailing market/official data and do not constitute a guaranteed trading quote.&rdquo;
        </p>
      </div>

      {/* Currency Selection Modal */}
      <CurrencyModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onSelect={handleSelectCurrency}
        selectedCode={modalType === "base" ? baseCode : targetCode}
        recentCodes={recentCodes}
        title={modalType === "base" ? "Select Base Currency (You Send)" : "Select Target Currency (You Receive)"}
      />

      {/* Rate Alert Modal */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        baseCode={baseCode}
        targetCode={targetCode}
        currentRate={calculation.effectiveRate.toNumber()}
      />
    </div>
  );
}
