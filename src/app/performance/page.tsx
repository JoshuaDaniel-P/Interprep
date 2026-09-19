"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { SkillBreakdown } from "@/components/dashboard/SkillBreakdown";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { ImprovementInsightCard } from "@/components/dashboard/ImprovementInsightCard";
import { useAuth } from "@/context/AuthContext";
import { interviewService } from "@/services/interview.service";
import { analyticsService } from "@/services/analytics.service";
import { InterviewSession } from "@/types/interview";
import { UserDashboardMetrics } from "@/types/user";
import { SkillBreakdownScores } from "@/types/evaluation";
import { TrendingUp, PlayCircle, Sparkles } from "lucide-react";

export default function PerformancePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [metrics, setMetrics] = useState<UserDashboardMetrics | null>(null);
  const [skills, setSkills] = useState<SkillBreakdownScores | null>(null);
  const [improvementNotice, setImprovementNotice] = useState<string | undefined>(undefined);
  const [recurringGaps, setRecurringGaps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPerformanceData() {
      setIsLoading(true);
      try {
        const userSessions = await interviewService.getRecentInterviews(user?.uid);
        setSessions(userSessions);

        const m = await analyticsService.getDashboardMetrics();
        const s = await analyticsService.getSkillBreakdown();

        if (userSessions.length >= 2) {
          const oldest = userSessions[userSessions.length - 1];
          const newest = userSessions[0];

          const oldComm = oldest.categoryScores?.communication || 58;
          const newComm = newest.categoryScores?.communication || 71;

          if (newComm > oldComm) {
            setImprovementNotice(`Communication rating increased from ${oldComm}% to ${newComm}% over your latest interview rounds.`);
          } else {
            const oldTech = oldest.categoryScores?.technicalKnowledge || 65;
            const newTech = newest.categoryScores?.technicalKnowledge || 75;
            setImprovementNotice(`Technical Knowledge rating progressed from ${oldTech}% to ${newTech}%.`);
          }
        } else {
          setImprovementNotice("Continuous performance tracking: Complete 2 or more mock interviews to benchmark your score trajectories.");
        }

        const gapsSet = new Set<string>();
        userSessions.forEach((sess) => {
          (sess.weaknesses || []).forEach((w) => {
            if (w.toLowerCase().includes("sql")) gapsSet.add("SQL & DB Optimization");
            if (w.toLowerCase().includes("structure") || w.toLowerCase().includes("star")) gapsSet.add("Answer Structure (STAR)");
            if (w.toLowerCase().includes("caching") || w.toLowerCase().includes("redis")) gapsSet.add("Caching & Architecture");
            if (w.toLowerCase().includes("concise")) gapsSet.add("Conciseness");
            if (w.toLowerCase().includes("metrics")) gapsSet.add("Quantitative Metrics");
          });
        });

        if (gapsSet.size === 0) {
          gapsSet.add("Answer Structure (STAR)");
          gapsSet.add("Project Technical Depth");
          gapsSet.add("Quantitative Metrics");
        }
        setRecurringGaps(Array.from(gapsSet).slice(0, 4));

        const scored = userSessions.filter((sess) => typeof sess.score === "number" && sess.score > 0);
        const totalSc = scored.reduce((acc, sess) => acc + (sess.score || 0), 0);
        const avgSc = scored.length > 0 ? Number((totalSc / scored.length).toFixed(1)) : m.averageScore;

        setMetrics({
          ...m,
          interviewsCompleted: scored.length,
          averageScore: avgSc,
        });
        setSkills(s);
      } catch (err) {
        console.warn("Performance data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPerformanceData();
  }, [user?.uid]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10 sm:space-y-12 lg:space-y-14 pb-16">
          {/* Page Header Panel */}
          <div className="glass-primary p-8 sm:p-12 rounded-[36px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 border-white/95 animate-section-stagger-1">
            <div className="space-y-2">
              <div className="glass-capsule px-4 py-1.5 text-xs font-black text-blue-800 gap-2 inline-flex items-center shadow-xs border-white/95">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                AI Evaluator Analytics
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Performance & Dimension Breakdown
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl leading-relaxed">
                Track your mock interview score progress, evaluation sub-scores, technical depth, and recurring improvement focus areas.
              </p>
            </div>

            <Link
              href="/interviews/setup"
              className="glass-button-primary px-8 py-3.5 text-sm font-black gap-3 w-full sm:w-auto inline-flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20"
            >
              <PlayCircle className="w-5 h-5 text-white" />
              Start New Interview
            </Link>
          </div>

          {/* 1. Core Evaluation Metrics */}
          {metrics && (
            <div className="animate-section-stagger-2">
              <MetricsGrid metrics={metrics} />
            </div>
          )}

          {/* 2. Actionable Improvement Insights & Skill Gaps */}
          <div className="animate-section-stagger-3">
            <ImprovementInsightCard
              recommendation={metrics?.topRecommendation || "Focus on quantifying project impact (e.g., latency, throughput, scale) in STAR technical responses."}
              improvementNotice={improvementNotice}
              recurringGaps={recurringGaps}
            />
          </div>

          {/* 3. Performance Overview & Skill Breakdown */}
          {metrics && skills && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 animate-section-stagger-4">
              <PerformanceOverview trendData={metrics.scoreTrend} />
              <SkillBreakdown skills={skills} />
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
