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
      className="glass liquid-glass-panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
      data-config='{"refraction": 0.22, "edgeHighlight": 0.8, "specular": 0.7, "zRadius": 18, "cornerRadius": 28}'
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Liquid Icon Bubble */}
        <div className="w-12 h-12 mockup-icon-circle text-blue-600 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
            NEXT INTERVIEW PRACTICE SESSION
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
            {lastSessionTitle}
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Calibrated for <strong className="text-slate-800">{targetRole}</strong> • Real-time AI evaluation
          </p>
        </div>
      </div>

      <div className="shrink-0 w-full sm:w-auto">
        <Link
          href="/interviews/setup"
          className="glass liquid-glass-btn-secondary px-5 py-2.5 text-xs font-black gap-2 w-full sm:w-auto inline-flex items-center justify-center"
          data-config='{"button": true, "zRadius": 12, "cornerRadius": 9999}'
        >
          <PlayCircle className="w-4 h-4 text-blue-600" />
          Start Session
        </Link>
      </div>
    </div>
  );
}
