import React from "react";
import { Lightbulb } from "lucide-react";

interface ImprovementInsightCardProps {
  recommendation: string;
}

export function ImprovementInsightCard({ recommendation }: ImprovementInsightCardProps) {
  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
        <Lightbulb className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
          Actionable Improvement Insight
        </h4>
        <p className="text-sm text-amber-900 mt-1 leading-relaxed">
          {recommendation}
        </p>
      </div>
    </div>
  );
}
