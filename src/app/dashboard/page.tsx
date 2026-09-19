"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PreparationReadinessCard } from "@/components/dashboard/PreparationReadinessCard";
import { ContinueWhereYouLeftOffCard } from "@/components/dashboard/ContinueWhereYouLeftOffCard";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { SkillBreakdown } from "@/components/dashboard/SkillBreakdown";
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable";
import { ImprovementInsightCard } from "@/components/dashboard/ImprovementInsightCard";
import { useAuth } from "@/context/AuthContext";
import { candidateService } from "@/services/candidate.service";
import { interviewService } from "@/services/interview.service";
import { analyticsService } from "@/services/analytics.service";
import { calculateReadiness } from "@/services/gapAnalysis.service";
import { CandidateProfile } from "@/types/candidate";
import { InterviewSession } from "@/types/interview";
import { UserDashboardMetrics } from "@/types/user";
import { SkillBreakdownScores } from "@/types/evaluation";
import { Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, profile: authProfile } = useAuth();

  const [profile, setProfile] = useState<CandidateProfile | null>(authProfile);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [metrics, setMetrics] = useState<UserDashboardMetrics | null>(null);
  const [skills, setSkills] = useState<SkillBreakdownScores | null>(null);
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const uid = user?.uid || authProfile?.uid || "candidate-user-active";
        const candidateData = await candidateService.getProfile(uid);
        setProfile(candidateData);

        const userSessions = await interviewService.getRecentInterviews(user?.uid);
        setSessions(userSessions);

        const m = await analyticsService.getDashboardMetrics();
        const s = await analyticsService.getSkillBreakdown();

        // Calculate continuous improvement over past sessions
        if (userSessions.length >= 2) {
          const oldest = userSessions[userSessions.length - 1];
          const newest = userSessions[0];

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

        // Aggregate recurring gaps
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

        // Category readiness
        if (candidateData) {
          const latestCatScores = userSessions[0]?.categoryScores;
          const analysis = calculateReadiness(candidateData, 50, latestCatScores);
          setCategoryReadiness(analysis.categoryReadiness);
        }

        // Build live metrics
        const scored = userSessions.filter((sess) => typeof sess.score === "number" && sess.score > 0);
        const totalSc = scored.reduce((acc, sess) => acc + (sess.score || 0), 0);
        const avgSc = scored.length > 0 ? Number((totalSc / scored.length).toFixed(1)) : m.averageScore;

        const realTrend = scored
          .slice(0, 6)
          .reverse()
          .map((sess) => ({
            date: new Date(sess.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: sess.score || 7.0,
          }));

        const latestRec =
          userSessions[0]?.evaluation?.recommendations?.[0] ||
          userSessions[0]?.improvements?.[0] ||
          m.topRecommendation;

        setMetrics({
          ...m,
          interviewsCompleted: scored.length,
          averageScore: avgSc,
          scoreTrend: realTrend.length > 0 ? realTrend : m.scoreTrend,
          topRecommendation: latestRec,
        });

        if (userSessions[0]?.evaluation?.skills) {
          setSkills(userSessions[0].evaluation.skills);
        } else {
          setSkills(s);
        }
      } catch (err) {
        console.warn("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.uid, authProfile]);

  const displayName =
    profile?.fullName?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const targetRole = profile?.targetGoal?.targetRole || "Software Developer";
  const readiness = profile?.readinessPercentage || 68;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 pb-12">
          {/* Profile Completion Prompt if new user */}
          {user && (!profile || !profile.isOnboarded) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">Complete Your Candidate Profile</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Set your college, degree, skills, and target stream to receive tailored mock questions and precise readiness scoring.
                  </p>
                </div>
              </div>
              <Link href="/profile/setup">
                <Button size="sm" className="whitespace-nowrap">
                  Complete Setup →
                </Button>
              </Link>
            </div>
          )}

          {/* Personal Greeting with Real Candidate Name */}
          <DashboardHeader userName={displayName} />

          {/* 1. Preparation Readiness % Card */}
          <PreparationReadinessCard
            targetRole={targetRole}
            readinessPercentage={readiness}
            categoryReadiness={categoryReadiness}
          />

          {/* 2. Continue Where You Left Off Quick Access */}
          <ContinueWhereYouLeftOffCard targetRole={targetRole} />

          {/* 3. Key Metrics */}
          {metrics && <MetricsGrid metrics={metrics} />}

          {/* 4. Actionable Improvement Insight */}
          <ImprovementInsightCard
            recommendation={metrics?.topRecommendation || `Practice ${targetRole} technical trade-offs and quantitative project results.`}
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
          <RecentInterviewsTable sessions={sessions} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
