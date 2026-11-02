"use client";

import React, { useState } from "react";
import { Bell, X, CheckCircle2, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { CountryFlag } from "./Flags";

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCode: string;
  targetCode: string;
  currentRate: number;
}

export function AlertModal({
  isOpen,
  onClose,
  baseCode,
  targetCode,
  currentRate,
}: AlertModalProps) {
  const [targetRate, setTargetRate] = useState<string>(String(currentRate));
  const [direction, setDirection] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [userContact, setUserContact] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/v1/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userContact,
          baseCurrency: baseCode,
          targetCurrency: targetCode,
          targetRate: Number(targetRate),
          direction,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to register rate alert");
      }

      setSuccessMessage(data.message || "Alert registered successfully!");
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 id="alert-modal-title" className="text-base font-bold text-white">
                Set FX Rate Alert
              </h2>
              <p className="text-xs text-slate-400">
                {baseCode}/{targetCode} Spot Target
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close alert modal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {successMessage ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">Alert Activated!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Current Benchmark Card */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CountryFlag code={baseCode} size={20} />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <CountryFlag code={targetCode} size={20} />
                <span className="text-xs font-bold text-slate-300 ml-1">
                  Current Spot Rate
                </span>
              </div>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {currentRate.toFixed(2)} {targetCode}
              </span>
            </div>

            {/* Target Direction */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Notify me when rate moves
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("ABOVE")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    direction === "ABOVE"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  📈 Rises Above (&gt;)
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("BELOW")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    direction === "BELOW"
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  📉 Drops Below (&lt;)
                </button>
              </div>
            </div>

            {/* Target Rate Input */}
            <div>
              <label htmlFor="target-rate-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Target Threshold ({targetCode})
              </label>
              <input
                id="target-rate-input"
                type="text"
                value={targetRate}
                onChange={(e) => setTargetRate(e.target.value)}
                placeholder="e.g. 1650.00"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Contact Information */}
            <div>
              <label htmlFor="contact-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Your Email or Phone Number
              </label>
              <input
                id="contact-input"
                type="text"
                value={userContact}
                onChange={(e) => setUserContact(e.target.value)}
                placeholder="e.g. trader@investor.ng or +234..."
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Activating Alert..." : "Activate Rate Alert"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
