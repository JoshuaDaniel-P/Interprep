import React from "react";
import { MetricTrendPoint } from "@/types/user";
import { TrendingUp } from "lucide-react";

interface PerformanceOverviewProps {
  trendData: MetricTrendPoint[];
}

export function PerformanceOverview({ trendData }: PerformanceOverviewProps) {
  if (!trendData || trendData.length === 0) return null;

  const minScore = 5.0;
  const maxScore = 10.0;
  const chartHeight = 140;
  const chartWidth = 500;

  const points = trendData.map((d, index) => {
    const x = (index / (trendData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.score - minScore) / (maxScore - minScore)) * chartHeight;
    return { x, y, score: d.score, date: d.date };
  });

  const svgPath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <div className="glass-primary rounded-[32px] p-6 sm:p-7 flex flex-col h-full relative overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="glass-icon-bubble w-9 h-9 text-blue-600">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Score Trend Overview
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Performance telemetry across recent mock rounds
            </p>
          </div>
        </div>
        <span className="glass-capsule text-xs font-extrabold text-slate-700 px-3.5 py-1.5 shadow-2xs">
          Last {trendData.length} Sessions
        </span>
      </div>

      <div className="flex-1 w-full overflow-x-auto pt-3">
        <div className="min-w-[420px] rounded-2xl p-4 bg-white/15 border border-white/40 backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
            className="w-full h-44 overflow-visible"
          >
            <defs>
              <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>

              {/* Data line elevated reflection filter */}
              <filter id="lineReflection" x="-10%" y="-30%" width="120%" height="180%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Background subtle horizontal gridlines */}
            {[6, 7, 8, 9].map((gridScore) => {
              const y = chartHeight - ((gridScore - minScore) / (maxScore - minScore)) * chartHeight;
              return (
                <line
                  key={gridScore}
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="rgba(255,255,255,0.8)"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
              );
            })}

            {/* Area fill */}
            <path
              d={`${svgPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
              fill="url(#scoreAreaGradient)"
            />

            {/* Elevated Primary Trend Line with subtle reflection */}
            <path
              d={svgPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineReflection)"
            />

            {/* 3D Glass Data Nodes (Crisp, with subtle glass highlight) */}
            {points.map((p, i) => (
              <g key={i}>
                {/* Ambient node glow ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="9"
                  fill="rgba(37, 99, 235, 0.12)"
                />
                {/* Node glass bead body */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5.5"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="drop-shadow-sm"
                />
                {/* Tiny specular glass glint */}
                <circle
                  cx={p.x - 1.5}
                  cy={p.y - 1.5}
                  r="1.2"
                  fill="#ffffff"
                />
                {/* Crisp dark readable score */}
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="text-xs font-black fill-slate-900 drop-shadow-2xs select-none"
                >
                  {p.score.toFixed(1)}
                </text>
                {/* Date label */}
                <text
                  x={p.x}
                  y={chartHeight + 22}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-500 select-none"
                >
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
