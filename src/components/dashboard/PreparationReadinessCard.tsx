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
      className="glass liquid-glass-panel p-6 sm:p-8 relative overflow-hidden"
      data-config='{"refraction": 0.3, "edgeHighlight": 0.95, "specular": 0.85, "fresnel": 0.65, "zRadius": 22, "cornerRadius": 32}'
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left Side Content */}
        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-2 mockup-pill-badge">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            Target Goal: <span className="font-extrabold">{targetRole}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Your Interview Readiness
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-lg leading-relaxed">
            Calculated in real-time based on profile completeness, technical & behavioral evaluation, and AI mock interview scores.
          </p>
        </div>

        {/* Right Side: Dimensional 3D Liquid-Glass Ring & Boost Button */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Dimensional Liquid-Glass Ring Dial with Illuminated Blue Material */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Outer Specular Curved Glass Border */}
            <div className="absolute inset-0 rounded-full border-4 border-white/95 shadow-xl bg-gradient-to-br from-white/90 via-blue-50/40 to-white/70 backdrop-blur-md" />
            
            {/* Illuminated Blue Arc inside Glass Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(224, 231, 255, 0.6)"
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
              <div className="text-3xl font-black tracking-tight text-slate-900">
                {readinessPercentage}%
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block leading-tight">
                PREPAREDNESS SCORE
              </span>
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 block leading-tight mt-0.5">
                SCORE
              </span>
            </div>
          </div>

          {/* Launch AI Interview Glass Capsule Button */}
          <Link
            href="/interviews/setup"
            className="glass liquid-glass-btn-primary px-6 py-2.5 text-xs font-black gap-2 inline-flex items-center"
            data-config='{"button": true, "zRadius": 14, "cornerRadius": 9999}'
          >
            Launch AI Interview
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
