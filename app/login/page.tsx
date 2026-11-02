"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA Challenge State
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [testMfaHint, setTestMfaHint] = useState<string | null>(null);

  const fillQuickAccount = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMessage(null);
    setRequiresMFA(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify?email=${encodeURIComponent(data.email || email)}`);
          return;
        }
        setErrorMessage(data.error || "Failed to log in.");
        setIsLoading(false);
        return;
      }

      // Check if 2FA is required
      if (data.requiresMFA) {
        setRequiresMFA(true);
        setTestMfaHint(data.testMfaCode || "123456");
        setIsLoading(false);
        return;
      }

      // Direct success
      const dest = returnUrl && returnUrl !== "/" ? returnUrl : data.redirectTo || "/";
      router.push(dest);
      router.refresh();
    } catch {
      setErrorMessage("Network error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: mfaCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "MFA Verification failed.");
        setIsLoading(false);
        return;
      }

      const dest = returnUrl && returnUrl !== "/" ? returnUrl : data.redirectTo || "/";
      router.push(dest);
      router.refresh();
    } catch {
      setErrorMessage("Network error verifying 2FA challenge.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500/20">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Rate<span className="text-emerald-400">Convert</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">
            {requiresMFA ? "Two-Factor Authentication" : "Institutional Gateway Access"}
          </h1>
          <p className="text-xs text-slate-400">
            {requiresMFA
              ? "Enter your secure authenticator or single-use verification code"
              : "Authentication required before accessing FX market intelligence & tools"}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {!requiresMFA ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate / Personal Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Authenticate &amp; Enter Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyMFA} className="space-y-5">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Elevated Role Verification</span>
                </div>
                <p className="text-[11px] text-emerald-400/80">
                  A 2FA code was issued for this privileged account.
                  {testMfaHint && (
                    <span className="block mt-1 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-white border border-emerald-500/30">
                      Sandbox Code: {testMfaHint}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit MFA / TOTP Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-mono tracking-widest text-center text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRequiresMFA(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || mfaCode.length < 6}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Confirm & Access"}
                </button>
              </div>
            </form>
          )}

          {/* Quick Credential Switcher (For Testing & Review) */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>Sandbox Instant Logins (1-Click Fill)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillQuickAccount("user@rateconvert.com", "User123!")}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-[10px] font-bold text-slate-300">Regular User</div>
                <div className="text-[9px] text-slate-500 font-mono">user@...</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount("admin@rateconvert.com", "Admin123!")}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-[10px] font-bold text-emerald-400">Admin User</div>
                <div className="text-[9px] text-slate-500 font-mono">admin@...</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount("superadmin@rateconvert.com", "SuperAdmin123!")}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-[10px] font-bold text-indigo-400">Super Admin</div>
                <div className="text-[9px] text-slate-500 font-mono">superadmin@...</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400">
          New to RateConvert?{" "}
          <Link
            href="/register"
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1120] text-slate-100 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}


