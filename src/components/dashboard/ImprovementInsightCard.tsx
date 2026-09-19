import React from "react";
import Link from "next/link";
import { Lightbulb, ArrowRight, TrendingUp, AlertTriangle, PlayCircle } from "lucide-react";

interface ImprovementInsightCardProps {
  recommendation: string;
  improvementNotice?: string;
  recurringGaps?: string[];
  hasSessions?: boolean;
}

export function ImprovementInsightCard({
  recommendation,
  improvementNotice,
  recurringGaps = [],
  hasSessions = true,
}: ImprovementInsightCardProps) {
  if (!hasSessions) {
    return (
      <div
        className="glass-primary p-6 sm:p-8 rounded-[30px] flex flex-col sm:flex-row items-center justify-between gap-6 border-white/95"
        data-config='{"refraction": 0.22, "edgeHighlight": 0.85, "specular": 0.8, "zRadius": 20, "cornerRadius": 30}'
      >
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-900 font-black text-sm sm:text-base">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>Diagnostic Feedback & Growth Trajectory</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
            Complete your first mock interview simulation to unlock tailored diagnostic feedback, communication insights, and recurring knowledge gaps.
          </p>
        </div>
        <Link
          href="/interviews/setup"
          className="glass-button-primary px-6 py-3 text-xs sm:text-sm font-black gap-2 inline-flex items-center shrink-0 shadow-lg shadow-blue-500/20"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Start Simulation</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Continuous Progress Tracking Green Liquid Glass Panel */}
      {improvementNotice && (
        <div
          className="liquid-glass-green-panel p-5 sm:p-6 rounded-[26px] flex items-center gap-4 border-white/95"
          data-config='{"refraction": 0.18, "edgeHighlight": 0.8, "specular": 0.75, "zRadius": 16, "cornerRadius": 26}'
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-400/50 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
              Continuous Progress Tracking
            </span>
            <p className="text-xs sm:text-sm font-black text-slate-950 mt-0.5">
              {improvementNotice}
            </p>
          </div>
        </div>
      )}

      {/* Actionable AI Improvement Insight Amber Liquid Glass Panel */}
      <div
        className="liquid-glass-amber-panel p-6 sm:p-8 rounded-[30px] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 border-white/95"
        data-config='{"refraction": 0.22, "edgeHighlight": 0.85, "specular": 0.8, "zRadius": 20, "cornerRadius": 30}'
      >
        <div className="space-y-3.5 flex-1 min-w-0">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/90 border border-amber-300/80 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <Lightbulb className="w-6 h-6 text-amber-600" />
            </div>

            <div>
              <span className="text-[10px] sm:text-[11px] font-black text-amber-900 uppercase tracking-wider block">
                ACTIONABLE IMPROVEMENT INSIGHT
              </span>
              <p className="text-sm sm:text-base font-black text-slate-950 leading-relaxed mt-0.5">
                {recommendation}
              </p>
            </div>
          </div>

          {/* Recurring Weaknesses Pills */}
          {recurringGaps.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:pl-16">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Target Focus:
              </span>
              {recurringGaps.map((gap) => (
                <span
                  key={gap}
                  className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white/90 text-slate-900 border border-amber-300/80 shadow-xs backdrop-blur-md hover:bg-white transition-colors"
                >
                  {gap}
                </span>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/interviews/setup"
          className="w-11 h-11 rounded-full bg-white/95 border border-amber-300/80 flex items-center justify-center text-amber-950 hover:bg-white hover:scale-105 transition-all shadow-md shrink-0 cursor-pointer pointer-events-auto"
          aria-label="Practice Weak Topics"
        >
          <ArrowRight className="w-5 h-5 text-amber-800" />
        </Link>
      </div>
    </div>
  );
}
