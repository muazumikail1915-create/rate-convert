"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export default function UnauthorizedPage() {
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);

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

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-rose-500/20">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-mono text-[11px] font-bold">
            403 - FORBIDDEN (RBAC POLICY GATE)
          </div>
          <h1 className="text-xl font-bold text-white">Access Tier Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your current account credentials do not have the required role privileges to view this
            administrative zone.
          </p>
        </div>

        {currentUser && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-left space-y-1">
            <div className="text-slate-500 text-[10px] uppercase font-bold">Active Principal</div>
            <div className="text-slate-200 font-medium">{currentUser.email}</div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-slate-400 text-[11px]">Assigned Role:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Permitted Workspace</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Switch to Privileged Account
          </button>
        </div>
      </div>
    </div>
  );
}

