import React from "react";
import Link from "next/link";
import { Target, Award, ArrowRight } from "lucide-react";

interface CategoryReadiness {
  technical?: number;
  projects?: number;
  communication?: number;
  behavioral?: number;
}

interface PreparationReadinessCardProps {
  targetRole: string;
  readinessPercentage: number;
  categoryReadiness?: CategoryReadiness;
}

export function PreparationReadinessCard({
  targetRole,
  readinessPercentage,
}: PreparationReadinessCardProps) {
  return (
    <div
      className="glass-primary p-8 sm:p-12 lg:p-14 rounded-[36px] relative overflow-hidden"
      data-config='{"refraction": 0.28, "edgeHighlight": 0.95, "specular": 0.85, "fresnel": 0.75, "zRadius": 24, "cornerRadius": 36}'
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 relative z-10">
        
        {/* Left Side Content */}
        <div className="space-y-4 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-2.5 glass-capsule px-4 py-1.5 text-xs font-black text-slate-800 border-white/95 shadow-xs">
            <Target className="w-4 h-4 text-blue-600" />
            <span>Target Goal: <strong className="text-blue-700 font-black">{targetRole}</strong></span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
            Your Interview Readiness
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl leading-relaxed">
            Calculated in real-time based on profile completeness, technical skills, and mock interview performance across all evaluated competencies.
          </p>
        </div>

        {/* Right Side: Dimensional 3D Liquid-Glass Ring & Start AI Interview CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10 shrink-0">
          {/* Dimensional Liquid-Glass Ring Dial with Illuminated Blue Material */}
          <div className="relative w-36 sm:w-40 h-36 sm:h-40 flex items-center justify-center">
            {/* Outer Specular Curved Glass Border */}
            <div className="absolute inset-0 rounded-full border-4 border-white/95 shadow-xl bg-gradient-to-br from-white/90 via-blue-50/40 to-white/70 backdrop-blur-md" />
            
            {/* Illuminated Blue Arc inside Glass Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(224, 231, 255, 0.55)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#illuminatedLiquidArc)"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - readinessPercentage / 100)}
                strokeLinecap="round"
                className="drop-shadow-[0_4px_12px_rgba(37,99,235,0.6)]"
              />
              <defs>
                <linearGradient id="illuminatedLiquidArc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Ring Score Display */}
            <div className="relative text-center z-10">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                {readinessPercentage}%
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 block leading-tight mt-0.5">
                PREPAREDNESS
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block leading-tight mt-0.5">
                SCORE
              </span>
            </div>
          </div>

          {/* Primary CTA Glass Capsule Button */}
          <Link
            href="/interviews/setup"
            className="glass-button-primary px-8 py-3.5 text-sm font-black gap-3 inline-flex items-center shadow-lg shadow-blue-500/25"
            data-config='{"button": true, "zRadius": 14, "cornerRadius": 9999}'
          >
            <span>Start AI Interview</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
