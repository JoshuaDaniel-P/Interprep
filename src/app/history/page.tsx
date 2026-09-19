"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable";
import { interviewService } from "@/services/interview.service";
import { InterviewSession } from "@/types/interview";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { PlayCircle, History, Sparkles } from "lucide-react";

export default function HistoryPage() {
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
          <div className="glass-primary rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                <div className="glass-icon-bubble w-9 h-9 text-blue-600">
                  <History className="w-5 h-5" />
                </div>
                Interview History
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Review completed sessions, transcripts, and score improvements over time.
              </p>
            </div>

            <Link href="/interviews/setup">
              <span className="glass-button-primary px-6 py-2.5 text-xs font-black gap-2 inline-flex items-center self-start sm:self-auto">
                <PlayCircle className="w-4 h-4" />
                Start New Interview
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="glass-secondary p-12 text-center text-slate-500 font-medium">
              Loading interview history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass-secondary p-12 text-center space-y-4">
              <div className="glass-icon-bubble w-14 h-14 text-blue-600 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">No mock sessions completed yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 font-medium">
                  Take your first simulated interview to generate STAR competency scores and personalized feedback.
                </p>
              </div>
              <Link href="/interviews/setup">
                <span className="glass-button-primary px-6 py-2.5 text-xs font-black gap-2 inline-flex items-center">
                  <PlayCircle className="w-4 h-4" />
                  Start Your First Interview
                </span>
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
