"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
} from "lucide-react";
import { generateHistoricalData, RateType } from "@/lib/mock-rates";
import { formatFxRate } from "@/lib/calculator";

interface RateChartProps {
  baseCode?: string;
  targetCode?: string;
  rateType?: RateType;
}

type TimeFrame = "24H" | "7D" | "30D" | "90D" | "1Y";

export const RateChart: React.FC<RateChartProps> = ({
  baseCode = "USD",
  targetCode = "NGN",
  rateType = "official",
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("30D");

  // Generate historical data points dynamically based on selected pair & timeframe
  const data = useMemo(() => {
    return generateHistoricalData(baseCode, targetCode, timeframe, rateType);
  }, [baseCode, targetCode, timeframe, rateType]);

  // Calculate high, low, first, last, and change percentage
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { high: 0, low: 0, changePercent: 0, changeAmount: 0, isPositive: true };
    }

    const rates = data.map((d) => d.rate);
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const startRate = data[0].rate;
    const endRate = data[data.length - 1].rate;
    const changeAmount = endRate - startRate;
    const changePercent = startRate !== 0 ? (changeAmount / startRate) * 100 : 0;

    return {
      high,
      low,
      startRate,
      endRate,
      changeAmount,
      changePercent,
      isPositive: changeAmount >= 0,
    };
  }, [data]);

  const minDomain = Math.floor(stats.low * 0.995 * 100) / 100;
  const maxDomain = Math.ceil(stats.high * 1.005 * 100) / 100;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              FX Market Dynamics
            </span>
            <span className="text-xs text-slate-400">
              {baseCode}/{targetCode} Spot Trend
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatFxRate(stats.endRate || 1540.50)}
            </h3>
            <span className="text-sm font-semibold text-slate-400">
              {targetCode} per 1 {baseCode}
            </span>

            {/* Change Badge */}
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                stats.isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {stats.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
              )}
              <span>
                {stats.isPositive ? "+" : ""}
                {stats.changePercent.toFixed(2)}% ({timeframe})
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl self-start sm:self-auto">
          {(["24H", "7D", "30D", "90D", "1Y"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === tf
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Indicators Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        <div className="p-3.5 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Period High
          </span>
          <span className="text-base font-extrabold text-white mt-0.5 block">
            {formatFxRate(stats.high)} {targetCode}
          </span>
        </div>

        <div className="p-3.5 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Period Low
          </span>
          <span className="text-base font-extrabold text-white mt-0.5 block">
            {formatFxRate(stats.low)} {targetCode}
          </span>
        </div>

        <div className="p-3.5 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Spread Range
          </span>
          <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">
            {(stats.high - stats.low).toFixed(2)} {targetCode}
          </span>
        </div>

        <div className="p-3.5 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Volatility Index
          </span>
          <span className="text-base font-extrabold text-amber-400 mt-0.5 block">
            {(Math.abs(stats.changePercent) * 0.85 + 0.4).toFixed(2)}% Vol
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stats.isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.4} />
                <stop offset="95%" stopColor={stats.isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              domain={[minDomain, maxDomain]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toFixed(v >= 100 ? 0 : 2)}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md">
                      <p className="text-[11px] text-slate-400">{p.date}</p>
                      <p className="text-base font-black text-white mt-0.5">
                        {formatFxRate(p.rate)} {targetCode}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span>H: {formatFxRate(p.high)}</span>
                        <span>L: {formatFxRate(p.low)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="rate"
              stroke={stats.isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#rateGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Continuous aggregation from Nigerian interbank & remittance settlement rails</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Spot Curve
          </span>
          <span className="text-slate-400">WAT / UTC+1 Timezone</span>
        </div>
      </div>
    </div>
  );
};
