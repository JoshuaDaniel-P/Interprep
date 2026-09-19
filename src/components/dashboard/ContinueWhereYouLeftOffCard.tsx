import React from "react";
import Link from "next/link";
import { PlayCircle, Sparkles } from "lucide-react";

interface ContinueWhereYouLeftOffCardProps {
  targetRole: string;
  lastSessionTitle?: string;
}

export function ContinueWhereYouLeftOffCard({
  targetRole,
  lastSessionTitle = "Adaptive Technical & System Design Round",
}: ContinueWhereYouLeftOffCardProps) {
  return (
    <div
      className="glass-secondary p-7 sm:p-8 rounded-[30px] flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 border-white/95 relative overflow-hidden"
      data-config='{"refraction": 0.22, "edgeHighlight": 0.85, "specular": 0.75, "zRadius": 20, "cornerRadius": 30}'
    >
      <div className="flex items-center gap-5 flex-1 min-w-0 w-full sm:w-auto">
        {/* Liquid Glass Icon Bubble */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-capsule text-blue-600 border-white/90 shadow-xs shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider block">
            NEXT INTERVIEW PRACTICE SESSION
          </span>
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-snug">
            {lastSessionTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            Calibrated for <strong className="text-slate-800 font-bold">{targetRole}</strong> • Real-time AI evaluation
          </p>
        </div>
      </div>

      <div className="shrink-0 w-full sm:w-auto">
        <Link
          href="/interviews/setup"
          className="glass-button-secondary px-7 py-3 text-xs sm:text-sm font-black gap-2.5 w-full sm:w-auto inline-flex items-center justify-center shadow-md active:scale-[0.98]"
          data-config='{"button": true, "zRadius": 12, "cornerRadius": 9999}'
        >
          <PlayCircle className="w-4 h-4 text-blue-600" />
          Start Session
        </Link>
      </div>
    </div>
  );
}
