"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PreparationReadinessCard } from "@/components/dashboard/PreparationReadinessCard";
import { ContinueWhereYouLeftOffCard } from "@/components/dashboard/ContinueWhereYouLeftOffCard";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { SkillBreakdown } from "@/components/dashboard/SkillBreakdown";
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable";
import { ImprovementInsightCard } from "@/components/dashboard/ImprovementInsightCard";
import { analyticsService } from "@/services/analytics.service";
import { interviewService } from "@/services/interview.service";
import { calculateReadiness } from "@/services/gapAnalysis.service";
import { useAuth } from "@/context/AuthContext";
import { InterviewSession } from "@/types/interview";
import { UserDashboardMetrics } from "@/types/user";
import { SkillBreakdownScores } from "@/types/evaluation";

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [metrics, setMetrics] = useState<UserDashboardMetrics | null>(null);
  const [skills, setSkills] = useState<SkillBreakdownScores | null>(null);
  const [recentSessions, setRecentSessions] = useState<InterviewSession[]>([]);
  const [improvementNotice, setImprovementNotice] = useState<string | undefined>(undefined);
  const [recurringGaps, setRecurringGaps] = useState<string[]>([]);
  const [categoryReadiness, setCategoryReadiness] = useState<{
    technical: number;
    projects: number;
    communication: number;
    behavioral: number;
  }>({
    technical: 72,
    projects: 81,
    communication: 64,
    behavioral: 78,
  });

  useEffect(() => {
    async function loadDashboardData() {
      const m = await analyticsService.getDashboardMetrics();
      const s = await analyticsService.getSkillBreakdown();
      const sessions = await interviewService.getRecentInterviews(user?.uid);

      setMetrics(m);
      setSkills(s);
      setRecentSessions(sessions);

      // Analyze cross-interview improvements & recurring weaknesses (Requirement 11)
      if (sessions.length >= 2) {
        const oldest = sessions[sessions.length - 1];
        const newest = sessions[0];

        const oldComm = oldest.categoryScores?.communication || 58;
        const newComm = newest.categoryScores?.communication || 71;

        if (newComm > oldComm) {
          setImprovementNotice(`Communication score improved from ${oldComm}% to ${newComm}% over your latest sessions.`);
        } else {
          const oldTech = oldest.categoryScores?.technicalKnowledge || 65;
          const newTech = newest.categoryScores?.technicalKnowledge || 75;
          setImprovementNotice(`Technical Knowledge score progressed from ${oldTech}% to ${newTech}%.`);
        }
      } else {
        setImprovementNotice("Continuous tracking active: Complete 2 or more mock interviews to benchmark progress over time.");
      }

      // Aggregate recurring gaps across past interviews
      const gapsSet = new Set<string>();
      sessions.forEach((sess) => {
        (sess.weaknesses || []).forEach((w) => {
          if (w.toLowerCase().includes("sql")) gapsSet.add("SQL & DB Optimization");
          if (w.toLowerCase().includes("structure") || w.toLowerCase().includes("star")) gapsSet.add("Answer Structure (STAR)");
          if (w.toLowerCase().includes("caching") || w.toLowerCase().includes("redis")) gapsSet.add("Caching & Architecture");
          if (w.toLowerCase().includes("concise")) gapsSet.add("Conciseness");
          if (w.toLowerCase().includes("metrics")) gapsSet.add("Quantitative Metrics");
        });
      });

      if (gapsSet.size === 0) {
        gapsSet.add("Answer Structure");
        gapsSet.add("Project Explanation");
        gapsSet.add("Technical Depth");
      }
      setRecurringGaps(Array.from(gapsSet).slice(0, 4));

      // Calculate candidate category readiness
      if (profile) {
        const latestCatScores = sessions[0]?.categoryScores;
        const analysis = calculateReadiness(profile, 50, latestCatScores);
        setCategoryReadiness(analysis.categoryReadiness);
      }
    }
    loadDashboardData();
  }, [profile, user]);

  const targetRole = profile?.targetGoal?.targetRole || "Software Developer";
  const readiness = profile?.readinessPercentage || 68;

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Personal Greeting */}
        <DashboardHeader userName={profile?.fullName || "Candidate"} />

        {/* 1. Preparation Readiness % Card with Category Breakdown (Requirement 12) */}
        <PreparationReadinessCard
          targetRole={targetRole}
          readinessPercentage={readiness}
          categoryReadiness={categoryReadiness}
        />

        {/* 2. Continue Where You Left Off Quick Access */}
        <ContinueWhereYouLeftOffCard targetRole={targetRole} />

        {/* 3. Key Metrics */}
        {metrics && <MetricsGrid metrics={metrics} />}

        {/* 4. Actionable Improvement Insight with Continuous Tracking (Requirement 11) */}
        <ImprovementInsightCard
          recommendation={metrics?.topRecommendation || "Practice answering architectural questions using the STAR framework."}
          improvementNotice={improvementNotice}
          recurringGaps={recurringGaps}
        />

        {/* 5. Performance Overview & Skill Breakdown */}
        {metrics && skills && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceOverview trendData={metrics.scoreTrend} />
            <SkillBreakdown skills={skills} />
          </div>
        )}

        {/* 6. Recent Mock Interviews Table */}
        <RecentInterviewsTable sessions={recentSessions} />
      </div>
    </AppShell>
  );
}
