"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Globe2,
  Bell,
  Shield,
  Clock,
  Code,
  LogOut,
  User,
  ShieldAlert,
} from "lucide-react";
import { CURRENT_MARKET_METRICS } from "@/lib/mock-rates";
import { DeveloperPortalModal } from "./DeveloperPortalModal";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: string;
}

export function Navbar() {
  const [watTime, setWatTime] = useState<string>("15:52:00 WAT");
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

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
            {/* Brand Logo Link */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">
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
            </Link>

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
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">API Keys &amp; Docs</span>
                <span className="sm:hidden">API</span>
              </button>

              {/* RBAC Workspaces Shortcuts */}
              {currentUser?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition"
                >
                  <span>Admin</span>
                </Link>
              )}

              {currentUser?.role === "SUPER_ADMIN" && (
                <>
                  <Link
                    href="/admin"
                    className="hidden md:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition"
                  >
                    <span>Admin</span>
                  </Link>
                  <Link
                    href="/super-admin"
                    className="hidden md:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition"
                  >
                    <span>Super Admin</span>
                  </Link>
                </>
              )}

              {/* User Session Badge & Logout */}
              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="hidden sm:block text-right">
                    <div className="text-[11px] font-bold text-white leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[9px] font-mono font-semibold text-emerald-400">
                      {currentUser.role}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  Sign In
                </Link>
              )}
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
