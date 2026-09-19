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
    <div className="mockup-glass-card p-6 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Score Trend Overview
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-bold">
          Last 6 Sessions
        </span>
      </div>

      <div className="flex-1 w-full overflow-x-auto pt-2">
        <div className="min-w-[400px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
            className="w-full h-44 overflow-visible"
          >
            <defs>
              <linearGradient id="mockupChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background horizontal gridlines */}
            {[6, 7, 8, 9].map((gridScore) => {
              const y = chartHeight - ((gridScore - minScore) / (maxScore - minScore)) * chartHeight;
              return (
                <line
                  key={gridScore}
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="rgba(0,0,0,0.06)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area fill */}
            <path
              d={`${svgPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
              fill="url(#mockupChartGradient)"
            />

            {/* Trend Line */}
            <path
              d={svgPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_4px_8px_rgba(59,130,246,0.4)]"
            />

            {/* Data points (Matching Mockup 3D Glowing Dots) */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  className="fill-blue-600 stroke-white stroke-[2.5px] drop-shadow-md"
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="text-[11px] font-black fill-slate-900"
                >
                  {p.score.toFixed(1)}
                </text>
                <text
                  x={p.x}
                  y={chartHeight + 22}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-400"
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
