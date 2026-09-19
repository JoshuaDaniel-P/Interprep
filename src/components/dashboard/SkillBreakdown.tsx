import React from "react";
import { SkillBreakdownScores } from "@/types/evaluation";
import { Layers } from "lucide-react";

interface SkillBreakdownProps {
  skills: SkillBreakdownScores;
}

export function SkillBreakdown({ skills }: SkillBreakdownProps) {
  const skillItems = [
    { key: "Content", score: skills.content.score },
    { key: "Structure", score: skills.structure.score },
    { key: "Relevance", score: skills.relevance.score },
    { key: "Clarity", score: skills.clarity.score },
    { key: "Confidence", score: skills.confidence.score },
    { key: "Conciseness", score: skills.conciseness.score },
  ];

  return (
    <div className="mockup-glass-card p-6 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Skill Performance Breakdown
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-bold">
          Evaluated via AI
        </span>
      </div>

      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
        {skillItems.map((item) => {
          const percentage = item.score * 10;
          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 font-semibold">{item.key}</span>
                <span className="text-slate-900 font-black">
                  {item.score.toFixed(1)} <span className="text-slate-400 font-medium">/ 10</span>
                </span>
              </div>
              
              {/* 3D Liquid Glass Progress Bar Track (Pixel-to-Pixel matching Mockup) */}
              <div className="h-2.5 w-full rounded-full bg-slate-200/70 border border-white/90 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${percentage}%`,
                    background:
                      item.score >= 8.0
                        ? "linear-gradient(90deg, #10b981, #34d399)"
                        : item.score >= 7.0
                        ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                        : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
