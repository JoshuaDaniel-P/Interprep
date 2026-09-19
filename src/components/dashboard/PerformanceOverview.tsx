import React from "react";
import { MetricTrendPoint } from "@/types/user";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          Score Trend Overview
        </CardTitle>
        <span className="text-xs text-gray-500 font-medium">Last 6 Sessions</span>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto pt-2">
          <div className="min-w-[400px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
              className="w-full h-44 overflow-visible"
            >
              {/* Background horizontal gridlines */}
              {[6, 7, 8, 9].map((gridScore) => {
                const y = chartHeight - ((gridScore - minScore) / (maxScore - minScore)) * chartHeight;
                return (
                  <g key={gridScore}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="4 4"
                    />
                    <text x="-5" y={y + 3} textAnchor="end" className="text-[10px] fill-gray-400">
                      {gridScore}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path
                d={`${svgPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                className="fill-brand-50/60"
              />

              {/* Trend Line */}
              <path
                d={svgPath}
                fill="none"
                stroke="#0275c5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    className="fill-white stroke-brand-600 stroke-[3px]"
                  />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-gray-800"
                  >
                    {p.score.toFixed(1)}
                  </text>
                  <text
                    x={p.x}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    className="text-[11px] font-medium fill-gray-500"
                  >
                    {p.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
