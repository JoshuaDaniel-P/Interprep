import React from "react";
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
import { candidateService } from "@/services/candidate.service";

export const revalidate = 0;

export default async function DashboardPage() {
  const profile = await candidateService.getProfile("candidate-demo-123");
  const metrics = await analyticsService.getDashboardMetrics();
  const skills = await analyticsService.getSkillBreakdown();
  const recentSessions = await interviewService.getRecentInterviews();

  const targetRole = profile.targetGoal?.targetRole || "Software Developer";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Personal Greeting */}
        <DashboardHeader userName={profile.fullName} />

        {/* 1. Preparation Readiness % Card */}
        <PreparationReadinessCard
          targetRole={targetRole}
          readinessPercentage={profile.readinessPercentage || 68}
        />

        {/* 2. Continue Where You Left Off Quick Access */}
        <ContinueWhereYouLeftOffCard targetRole={targetRole} />

        {/* 3. Key Metrics */}
        <MetricsGrid metrics={metrics} />

        {/* 4. Actionable Improvement Insight */}
        <ImprovementInsightCard recommendation={metrics.topRecommendation} />

        {/* 5. Performance Overview & Skill Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceOverview trendData={metrics.scoreTrend} />
          <SkillBreakdown skills={skills} />
        </div>

        {/* 6. Recent Mock Interviews Table */}
        <RecentInterviewsTable sessions={recentSessions} />
      </div>
    </AppShell>
  );
}
