import React from "react";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

interface ImprovementInsightCardProps {
  recommendation: string;
  improvementNotice?: string;
  recurringGaps?: string[];
}

export function ImprovementInsightCard({
  recommendation,
  improvementNotice,
  recurringGaps,
}: ImprovementInsightCardProps) {
  return (
    <div className="space-y-4">
      {/* Dynamic Improvement Tracking Callout (Requirement 11) */}
      {improvementNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              Continuous Progress Tracking
            </span>
            <p className="text-sm font-semibold text-emerald-900 mt-0.5">
              {improvementNotice}
            </p>
          </div>
        </div>
      )}

      {/* Actionable Insight */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Actionable Improvement Insight
            </h4>
            <p className="text-sm text-amber-950 mt-1 leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>

        {recurringGaps && recurringGaps.length > 0 && (
          <div className="sm:border-l sm:border-amber-200 sm:pl-4 shrink-0 space-y-1">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Identified Focus Areas:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {recurringGaps.map((gap, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100/80 text-amber-900 border border-amber-300"
                >
                  {gap}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
