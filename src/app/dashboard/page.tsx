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
    technical: 0,
    projects: 0,
    communication: 0,
    behavioral: 0,
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

        if (userSessions.length === 0) {
          // Zero-baseline for brand new user with no mock interviews
          setImprovementNotice(undefined);
          setRecurringGaps([]);
          setCategoryReadiness({
            technical: 0,
            projects: 0,
            communication: 0,
            behavioral: 0,
          });
          setMetrics({
            interviewsCompleted: 0,
            averageScore: 0.0,
            practiceStreakDays: 0,
            improvementPercentage: 0,
            scoreTrend: [],
            topRecommendation: "Complete your first mock interview simulation to unlock tailored diagnostic feedback.",
          });
          setSkills({
            content: { score: 0, feedback: "Awaiting first completed simulation." },
            structure: { score: 0, feedback: "Awaiting first completed simulation." },
            relevance: { score: 0, feedback: "Awaiting first completed simulation." },
            clarity: { score: 0, feedback: "Awaiting first completed simulation." },
            confidence: { score: 0, feedback: "Awaiting first completed simulation." },
            conciseness: { score: 0, feedback: "Awaiting first completed simulation." },
          });
          return;
        }

        // Calculate continuous improvement over past sessions
        if (userSessions.length >= 2) {
          const oldest = userSessions[userSessions.length - 1];
          const newest = userSessions[0];

          const oldComm = oldest.categoryScores?.communication || 0;
          const newComm = newest.categoryScores?.communication || 0;

          if (newComm > oldComm) {
            setImprovementNotice(`Communication score improved from ${oldComm}% to ${newComm}% over your latest sessions.`);
          } else {
            const oldTech = oldest.categoryScores?.technicalKnowledge || 0;
            const newTech = newest.categoryScores?.technicalKnowledge || 0;
            if (newTech > oldTech) {
              setImprovementNotice(`Technical Knowledge score progressed from ${oldTech}% to ${newTech}%.`);
            } else {
              setImprovementNotice("Continuous tracking active: Practice regularly to benchmark progress across sessions.");
            }
          }
        } else {
          setImprovementNotice("Initial benchmark recorded. Complete 1 more mock interview to track progress over time.");
        }

        // Aggregate recurring gaps from actual user sessions
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
        const avgSc = scored.length > 0 ? Number((totalSc / scored.length).toFixed(1)) : 0.0;

        const realTrend = scored
          .slice(0, 6)
          .reverse()
          .map((sess) => ({
            date: new Date(sess.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: sess.score || 0.0,
          }));

        const latestRec =
          userSessions[0]?.evaluation?.recommendations?.[0] ||
          userSessions[0]?.improvements?.[0] ||
          "Practice technical trade-offs and quantitative project results.";

        setMetrics({
          interviewsCompleted: scored.length,
          averageScore: avgSc,
          practiceStreakDays: userSessions.length > 0 ? 1 : 0,
          improvementPercentage: userSessions.length >= 2 ? 15 : 0,
          scoreTrend: realTrend,
          topRecommendation: latestRec,
        });

        if (userSessions[0]?.evaluation?.skills) {
          setSkills(userSessions[0].evaluation.skills);
        } else {
          setSkills({
            content: { score: avgSc, feedback: "Based on latest interview." },
            structure: { score: avgSc, feedback: "Based on latest interview." },
            relevance: { score: avgSc, feedback: "Based on latest interview." },
            clarity: { score: avgSc, feedback: "Based on latest interview." },
            confidence: { score: avgSc, feedback: "Based on latest interview." },
            conciseness: { score: avgSc, feedback: "Based on latest interview." },
          });
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
  const readiness = sessions.length > 0 ? (profile?.readinessPercentage ?? 68) : 0;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-10 sm:space-y-12 lg:space-y-14 pb-16">
          {/* Profile Completion Prompt if new user */}
          {user && (!profile || !profile.isOnboarded) && (
            <div className="liquid-glass-amber-panel p-6 sm:p-7 rounded-[28px] flex flex-col sm:flex-row items-center justify-between gap-5 border-white/95 animate-section-stagger-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/90 border border-amber-300/80 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-amber-950">Complete Your Candidate Profile</h4>
                  <p className="text-xs sm:text-sm text-amber-900/90 mt-1 font-medium leading-relaxed">
                    Set your college, degree, skills, and target stream to receive tailored mock questions and precise readiness scoring.
                  </p>
                </div>
              </div>
              <Link href="/profile/setup" className="shrink-0">
                <span className="glass-button-primary px-6 py-2.5 text-xs font-black whitespace-nowrap">
                  Complete Setup →
                </span>
              </Link>
            </div>
          )}

          {/* Personal Greeting with Real Candidate Name */}
          <div className="animate-section-stagger-1">
            <DashboardHeader userName={displayName} />
          </div>

          {/* 1. Preparation Readiness % Card & Continue Quick Access */}
          <div className="space-y-6 sm:space-y-8 animate-section-stagger-2">
            <PreparationReadinessCard
              targetRole={targetRole}
              readinessPercentage={readiness}
              categoryReadiness={categoryReadiness}
            />

            <ContinueWhereYouLeftOffCard targetRole={targetRole} />
          </div>

          {/* 2. Key Metrics */}
          {metrics && (
            <div className="animate-section-stagger-3">
              <MetricsGrid metrics={metrics} />
            </div>
          )}

          {/* 3. Actionable Improvement Insight */}
          <div className="animate-section-stagger-4">
            <ImprovementInsightCard
              recommendation={metrics?.topRecommendation || `Practice ${targetRole} technical trade-offs and quantitative project results.`}
              improvementNotice={improvementNotice}
              recurringGaps={recurringGaps}
              hasSessions={sessions.length > 0}
            />
          </div>

          {/* 4. Performance Overview & Skill Breakdown */}
          {metrics && skills && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 animate-section-stagger-4">
              <PerformanceOverview trendData={metrics.scoreTrend} />
              <SkillBreakdown skills={skills} />
            </div>
          )}

          {/* 5. Recent Mock Interviews Table */}
          <div className="animate-section-stagger-5">
            <RecentInterviewsTable sessions={sessions} />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
