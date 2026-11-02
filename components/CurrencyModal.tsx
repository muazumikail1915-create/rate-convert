"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Check, Globe } from "lucide-react";
import { Currency, SUPPORTED_CURRENCIES } from "@/lib/mock-rates";
import { CountryFlag } from "./Flags";

export interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCode: string;
  recentCodes?: string[];
  title?: string;
}

export function CurrencyModal({
  isOpen,
  onClose,
  onSelect,
  selectedCode,
  recentCodes = ["USD", "NGN", "GBP", "EUR", "CAD"],
  title = "Select Currency",
}: CurrencyModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "major" | "african" | "emerging">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setSearchQuery("");
      setActiveCategory("all");
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter currencies based on search and category
  const filteredCurrencies = SUPPORTED_CURRENCIES.filter((currency) => {
    const matchesSearch =
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === "all" || currency.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const recentCurrencies = SUPPORTED_CURRENCIES.filter((c) =>
    recentCodes.includes(c.code)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="currency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h2 id="currency-modal-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close currency selection modal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by currency code, country or name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              aria-label="Search currencies"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                { id: "all", label: "All FX" },
                { id: "major", label: "Major Global" },
                { id: "african", label: "African FX" },
                { id: "emerging", label: "Emerging" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recently Used Currencies */}
        {!searchQuery && activeCategory === "all" && (
          <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Recently Selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentCurrencies.map((currency) => {
                const isSelected = currency.code === selectedCode;
                return (
                  <button
                    key={currency.code}
                    onClick={() => {
                      onSelect(currency);
                      onClose();
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                        : "bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    <CountryFlag code={currency.code} size={18} />
                    <span className="font-semibold">{currency.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Currency List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/50 max-h-[380px]">
          {filteredCurrencies.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">No currencies matching &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-emerald-400 hover:underline"
              >
                Clear search query
              </button>
            </div>
          ) : (
            filteredCurrencies.map((currency) => {
              const isSelected = currency.code === selectedCode;
              return (
                <button
                  key={currency.code}
                  onClick={() => {
                    onSelect(currency);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-white"
                      : "hover:bg-slate-800/70 border border-transparent text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <CountryFlag code={currency.code} size={28} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base tracking-wide">
                          {currency.code}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {currency.symbol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{currency.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{currency.country}</span>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer info */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Rates benchmarked against CBN NFEM &amp; Interbank</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
}
