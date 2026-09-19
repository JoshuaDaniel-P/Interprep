import React from "react";
import { Lightbulb, ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ImprovementInsightCardProps {
  recommendation: string;
  improvementNotice?: string;
  recurringGaps?: string[];
}

export function ImprovementInsightCard({
  recommendation,
  improvementNotice,
  recurringGaps = [],
}: ImprovementInsightCardProps) {
  return (
    <div className="space-y-4">
      {/* Continuous Progress Tracking Green Liquid Glass Panel */}
      {improvementNotice && (
        <div
          className="glass liquid-glass-green-panel p-4 flex items-center gap-3.5"
          data-config='{"refraction": 0.18, "edgeHighlight": 0.75, "specular": 0.7, "zRadius": 14, "cornerRadius": 28}'
        >
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-800 shrink-0 border border-emerald-400/50 shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
              Continuous Progress Tracking
            </span>
            <p className="text-xs font-black text-slate-950">
              {improvementNotice}
            </p>
          </div>
        </div>
      )}

      {/* Actionable AI Improvement Insight Amber Liquid Glass Panel */}
      <div
        className="glass liquid-glass-amber-panel p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
        data-config='{"refraction": 0.2, "edgeHighlight": 0.8, "specular": 0.75, "zRadius": 16, "cornerRadius": 28}'
      >
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>

            <div>
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                ACTIONABLE IMPROVEMENT INSIGHT
              </span>
              <p className="text-xs sm:text-sm font-black text-slate-950 leading-relaxed mt-0.5">
                {recommendation}
              </p>
            </div>
          </div>

          {/* Recurring Weaknesses Pills */}
          {recurringGaps.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pl-13">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Target Areas:
              </span>
              {recurringGaps.map((gap) => (
                <span
                  key={gap}
                  className="px-3 py-1 rounded-full text-xs font-black bg-white/85 text-slate-950 border border-amber-300/80 shadow-xs backdrop-blur-md"
                >
                  {gap}
                </span>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/interviews/setup"
          className="w-9 h-9 rounded-full bg-white/95 border border-amber-200 flex items-center justify-center text-amber-900 hover:bg-amber-100 transition-colors shadow-xs shrink-0 cursor-pointer"
          aria-label="Practice Weak Topics"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
