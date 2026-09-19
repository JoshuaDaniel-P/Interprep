import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Target, Award, ArrowRight, Code2, FolderGit2, MessageSquare, Users } from "lucide-react";

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
  categoryReadiness,
}: PreparationReadinessCardProps) {
  const categories = [
    { label: "Technical", val: categoryReadiness?.technical ?? 0, icon: Code2 },
    { label: "Projects", val: categoryReadiness?.projects ?? 0, icon: FolderGit2 },
    { label: "Communication", val: categoryReadiness?.communication ?? 0, icon: MessageSquare },
    { label: "Behavioral", val: categoryReadiness?.behavioral ?? 0, icon: Users },
  ];

  return (
    <Card className="bg-gradient-to-r from-brand-950 via-brand-900 to-slate-900 text-white shadow-card border-brand-800">
      <CardContent className="p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-100 border border-white/10">
            <Target className="w-3.5 h-3.5 text-brand-300" />
            Target Goal: {targetRole}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Interview Readiness
          </h2>
          <p className="text-xs sm:text-sm text-brand-100/90 max-w-xl leading-relaxed">
            Calculated via weighted composite: Profile Completeness (20%) + Course Roadmap (20%) + Mock Interview Performance (60% weighted across Technical, Problems, Projects, Communication, and Behavioral).
          </p>

          {/* Category Readiness Pills (Requirement 12) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2"
                >
                  <Icon className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] text-brand-200 block uppercase font-bold tracking-wider">
                      {cat.label}
                    </span>
                    <span className="text-xs font-black text-white">{cat.val}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Readiness Circular / Badge Score */}
        <div className="flex flex-col items-center justify-center bg-white/10 border border-white/15 backdrop-blur-xs rounded-2xl p-6 min-w-[210px] shrink-0 text-center">
          <Award className="w-6 h-6 text-brand-300 mb-1" />
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {readinessPercentage}%
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-200 mt-1">
            Overall Readiness
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
