"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable";
import { interviewService } from "@/services/interview.service";
import { InterviewSession } from "@/types/interview";
import { useAuth } from "@/context/AuthContext";
import { PlayCircle, History, Sparkles } from "lucide-react";

export default function InterviewsHistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      try {
        const list = await interviewService.getRecentInterviews(user?.uid);
        setSessions(list);
      } catch (err) {
        console.warn("Error loading user interviews:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, [user?.uid]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <History className="w-7 h-7 text-blue-600" />
                Interview History
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Review completed sessions, transcripts, and score improvements over time.
              </p>
            </div>

            <Link
              href="/interviews/setup"
              className="liquid-glass-btn-primary px-5 py-2.5 text-xs font-bold gap-2 inline-flex items-center self-start sm:self-auto"
            >
              <PlayCircle className="w-4 h-4" />
              Start New Interview
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500 bg-white/70 rounded-2xl border border-white">
              Loading interview history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center bg-white/80 rounded-2xl border border-white shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No interview attempts recorded yet.</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
                  Take your first simulated interview to generate STAR competency scores and personalized feedback.
                </p>
              </div>
              <Link
                href="/interviews/setup"
                className="liquid-glass-btn-primary px-6 py-2.5 text-xs font-bold gap-2 inline-flex items-center"
              >
                <PlayCircle className="w-4 h-4" />
                Start Your First Interview
              </Link>
            </div>
          ) : (
            <RecentInterviewsTable sessions={sessions} />
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
