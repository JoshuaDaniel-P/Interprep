"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
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
      } catch (err) {
        console.warn("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.uid, authProfile]);

  // Derived Candidate Information
  const displayName =
    profile?.fullName?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const targetRole = profile?.targetGoal?.targetRole || "Software Developer";
  const readiness = profile?.readinessPercentage || 68;

  // Compute Live Metrics from actual sessions
  const scoredSessions = sessions.filter((s) => typeof s.score === "number" && s.score > 0);
  const totalScore = scoredSessions.reduce((acc, s) => acc + (s.score || 0), 0);
  const averageScore = scoredSessions.length > 0 ? Number((totalScore / scoredSessions.length).toFixed(1)) : 7.4;

  const scoreTrend = scoredSessions.slice(0, 7).reverse().map((s, idx) => ({
    label: `Session ${idx + 1}`,
    score: s.score || 7.0,
  }));

  const metrics: UserDashboardMetrics = {
    interviewsCompleted: scoredSessions.length,
    averageScore,
    totalPracticeTimeMinutes: Math.round(
      sessions.reduce((acc, s) => acc + (s.timeElapsedSeconds || 300), 0) / 60
    ),
    preparationReadiness: readiness,
    scoreTrend:
      scoreTrend.length > 0
        ? scoreTrend
        : [
            { label: "Session 1", score: 6.8 },
            { label: "Session 2", score: 7.2 },
            { label: "Session 3", score: 7.6 },
          ],
    topRecommendation:
      profile?.education?.weakSubjects?.length
        ? `Focus on reviewing ${profile.education.weakSubjects.join(" & ")} and structuring STAR responses.`
        : `Practice ${targetRole} technical trade-offs and quantitative project results.`,
  };

  const skills: SkillBreakdownScores = {
    content: { score: 7.8, feedback: `Technical specifics aligned with ${targetRole}.` },
    structure: { score: 7.4, feedback: "STAR methodology application in recent answers." },
    relevance: { score: 8.2, feedback: "Direct alignment to company type expectations." },
    clarity: { score: 7.9, feedback: "Concise articulation and thought organization." },
    confidence: { score: 7.6, feedback: "Decisive ownership in technical explanations." },
    conciseness: { score: 7.5, feedback: "Optimal response pacing with minimal filler words." },
  };

  return (
    <AppShell>
      <div className="space-y-6">
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
        <RecentInterviewsTable sessions={sessions} />
      </div>
    </AppShell>
  );
}
