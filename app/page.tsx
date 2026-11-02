"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FXTicker } from "@/components/FXTicker";
import { Converter } from "@/components/Converter";
import { RateChart } from "@/components/RateChart";
import { RateComparison } from "@/components/RateComparison";
import { MarketIntelligence } from "@/components/MarketIntelligence";
import { RateType } from "@/lib/mock-rates";
import {
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  Cpu,
} from "lucide-react";

export default function Home() {
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [targetCurrency, setTargetCurrency] = useState<string>("NGN");
  const [rateType, setRateType] = useState<RateType>("official");
  const [currentAmount, setCurrentAmount] = useState<string>("1000");

  const handleCurrencyChange = (base: string, target: string, type: RateType) => {
    setBaseCurrency(base);
    setTargetCurrency(target);
    setRateType(type);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100 font-sans selection:bg-emerald-500/20">
      {/* Top Navbar */}
      <Navbar />

      {/* FX Spot Ticker */}
      <FXTicker />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* Hero Tagline */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Availability FX Intelligence Rails</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Real-Time Currency Rates &amp; <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Nigerian FX Benchmarks
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Directly cross-examine Official CBN NFEM rates, Commercial Bank FX limits, and live remittance arbitrage (Wise, LemFi, Flutterwave) in high precision.
          </p>
        </div>

        {/* Section 1: Hero Converter Board & Real-Time Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Converter (7 cols) */}
          <div className="lg:col-span-7">
            <Converter
              initialBase={baseCurrency}
              initialTarget={targetCurrency}
              onCurrencyChange={handleCurrencyChange}
            />
          </div>

          {/* Right Column: Historical Rate Chart (5 cols) */}
          <div className="lg:col-span-5">
            <RateChart
              baseCode={baseCurrency}
              targetCode={targetCurrency}
              rateType={rateType}
            />
          </div>
        </div>

        {/* Section 2: Rate Comparison Matrix */}
        <section aria-labelledby="rate-comparison-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="rate-comparison-heading" className="sr-only">
              Market Rate Comparison
            </h2>
          </div>
          <RateComparison
            amount={currentAmount}
            baseCode={baseCurrency}
            targetCode={targetCurrency}
          />
        </section>

        {/* Section 3: Nigerian FX Market Intelligence & Liquidity Overview */}
        <section aria-labelledby="market-intelligence-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="market-intelligence-heading" className="sr-only">
              Nigerian FX Market Intelligence
            </h2>
          </div>
          <MarketIntelligence />
        </section>

        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/70 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">CBN NFEM Compliance</h4>
            <p className="text-xs text-slate-400">
              Strictly aligned with Central Bank of Nigeria autonomous market clearing rates and FMDQ OTC price discovery.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/70 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Decimal.js Precision</h4>
            <p className="text-xs text-slate-400">
              Zero-floating-point discrepancy arithmetic guarantees institutional-grade computational exactness.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/70 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Remittance Arbitrage</h4>
            <p className="text-xs text-slate-400">
              Compares net payouts after deductions across top corridors (Wise, LemFi, Sendwave, Flutterwave).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/70 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">WAT Timezone Sync</h4>
            <p className="text-xs text-slate-400">
              All trading timestamps, session schedules, and staleness markers are synchronized to West Africa Time (UTC+1).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                RC
              </div>
              <div>
                <span className="text-base font-bold text-white">
                  Rate<span className="text-emerald-400">Convert</span> FX
                </span>
                <p className="text-xs text-slate-400">
                  Nigerian Foreign Exchange Intelligence &amp; Multi-Provider Benchmarks
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                NFEM Methodology
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Bank FX Circulars
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Developer API
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Disclaimer &amp; Terms
              </a>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              © 2026 RateConvert Platform. All rights reserved.
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-400 max-w-4xl mx-auto leading-relaxed">
            Regulatory Notice: Exchange rates and fee structures displayed are collected for analytical and informational purposes. Real-time bank execution quotes, official NFEM bids, and cross-border remittance delivery times are subject to prevailing liquidity, KYC clearance, and institutional market spreads.
          </div>
        </div>
      </footer>
    </div>
  );
}
