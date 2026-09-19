import React from "react";
import { SkillBreakdownScores } from "@/types/evaluation";
import { Layers, Sparkles } from "lucide-react";

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
    <div className="glass-primary rounded-[32px] p-6 sm:p-7 flex flex-col h-full relative overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="glass-icon-bubble w-9 h-9 text-blue-600">
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Skill Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Multi-dimensional competency rating
            </p>
          </div>
        </div>
        <div className="glass-capsule px-3 py-1.5 text-xs font-extrabold text-blue-800 bg-white/60 border border-white/95 inline-flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Evaluated via AI</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center pt-2">
        {skillItems.map((item) => {
          const percentage = item.score * 10;
          return (
            <div key={item.key} className="space-y-1.5 p-2 rounded-2xl hover:bg-white/30 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-extrabold tracking-tight">{item.key}</span>
                <div className="inline-flex items-baseline gap-1 px-2 py-0.5 rounded-lg bg-white/40 border border-white/70 shadow-2xs">
                  <span className="text-slate-900 font-black text-xs">
                    {item.score.toFixed(1)}
                  </span>
                  <span className="text-slate-400 font-semibold text-[10px]">/ 10</span>
                </div>
              </div>
              
              {/* Dimensional Physical Glass Track with Liquid Fill */}
              <div className="glass-progress-tube w-full h-3 rounded-full bg-slate-200/35 border border-white/90 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06),inset_0_-1px_1px_rgba(255,255,255,0.9)] p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.score >= 8.0
                      ? "glass-fluid-green"
                      : item.score >= 7.0
                      ? "glass-fluid-blue"
                      : "glass-fluid-amber"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
