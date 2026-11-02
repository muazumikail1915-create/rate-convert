"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Globe2,
  Bell,
  Shield,
  Clock,
  Code,
} from "lucide-react";
import { CURRENT_MARKET_METRICS } from "@/lib/mock-rates";
import { DeveloperPortalModal } from "./DeveloperPortalModal";

export function Navbar() {
  const [watTime, setWatTime] = useState<string>("15:52:00 WAT");
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setWatTime(`${formatted} WAT`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Rate<span className="text-emerald-400">Convert</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NFEM 2.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-wide font-medium hidden sm:block">
                  Institutional FX &amp; Remittance Intelligence
                </p>
              </div>
            </div>

            {/* Center Market Status Bar */}
            <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-white">NFEM Window:</span>
                <span className="text-emerald-400 font-semibold">{CURRENT_MARKET_METRICS.marketStatus}</span>
              </div>

              <span className="text-slate-600">|</span>

              <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{watTime}</span>
              </div>

              <span className="text-slate-600">|</span>

              <div className="text-slate-400">
                CBN Mid: <strong className="text-white font-mono">₦{CURRENT_MARKET_METRICS.cbnRate.toFixed(2)}</strong>
              </div>
            </div>

            {/* Right Action Items */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{watTime.slice(0, 5)}</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>CBN Verified</span>
              </div>

              <button
                type="button"
                onClick={() => setIsDevModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Code className="w-3.5 h-3.5" />
                <span>API Keys &amp; Docs</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Developer API Portal Modal */}
      <DeveloperPortalModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />
    </>
  );
}
