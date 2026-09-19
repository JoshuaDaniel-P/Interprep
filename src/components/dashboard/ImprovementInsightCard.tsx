import React from "react";
import Link from "next/link";
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImprovementInsightCardProps {
  recommendation: string;
  improvementNotice?: string;
  recurringGaps?: string[];
  hasSessions?: boolean;
}

export function ImprovementInsightCard({
  recommendation,
  improvementNotice,
  recurringGaps,
  hasSessions = false,
}: ImprovementInsightCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Improvements</h3>
            <p className="text-xs text-slate-500">Targeted skill growth areas and diagnostic feedback</p>
          </div>
        </div>
        {hasSessions && improvementNotice && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Tracking Active
          </span>
        )}
      </div>

      {!hasSessions ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-800">
              No interview performance records yet.
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Complete your first mock interview simulation to unlock tailored diagnostic feedback, communication insights, and recurring knowledge gaps.
            </p>
          </div>
          <Link href="/setup">
            <Button size="sm" className="whitespace-nowrap text-xs font-bold gap-1.5 shrink-0">
              <span>Start Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {improvementNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{improvementNotice}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                Primary Recommendation
              </span>
              <p className="text-sm text-amber-950 leading-relaxed">
                {recommendation}
              </p>
            </div>

            {recurringGaps && recurringGaps.length > 0 && (
              <div className="sm:border-l sm:border-amber-200 sm:pl-4 shrink-0 space-y-1 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
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
      )}
    </div>
  );
}
