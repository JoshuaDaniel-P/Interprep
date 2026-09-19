import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Target, Award, ArrowRight } from "lucide-react";

interface PreparationReadinessCardProps {
  targetRole: string;
  readinessPercentage: number;
}

export function PreparationReadinessCard({
  targetRole,
  readinessPercentage,
}: PreparationReadinessCardProps) {
  return (
    <Card className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 text-white shadow-card">
      <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-100 border border-white/10">
            <Target className="w-3.5 h-3.5 text-brand-300" />
            Target Goal: {targetRole}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Interview Readiness
          </h2>
          <p className="text-xs sm:text-sm text-brand-100/90 max-w-lg leading-relaxed">
            Calculated in real-time based on profile completeness, technical skills, course progress, and mock interview scores.
          </p>
        </div>

        {/* Readiness Circular / Badge Score */}
        <div className="flex flex-col items-center justify-center bg-white/10 border border-white/15 backdrop-blur-xs rounded-2xl p-6 min-w-[200px] shrink-0 text-center">
          <Award className="w-6 h-6 text-brand-300 mb-1" />
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {readinessPercentage}%
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-200 mt-1">
            Preparedness Score
          </span>
          <Link href={`/courses/${encodeURIComponent(targetRole)}`} className="w-full mt-3">
            <Button size="sm" className="w-full bg-white text-brand-950 hover:bg-brand-50 border-none font-bold text-xs gap-1">
              Boost Score
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
