"use client";

import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import Link from "next/link";
=======
>>>>>>> origin/main
import { AppShell } from "@/components/layout/AppShell";
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable";
import { interviewService } from "@/services/interview.service";
import { InterviewSession } from "@/types/interview";
import { useAuth } from "@/context/AuthContext";
<<<<<<< HEAD
import { Button } from "@/components/ui/Button";
import { PlayCircle, History, Sparkles } from "lucide-react";
=======
import { History as HistoryIcon } from "lucide-react";
>>>>>>> origin/main

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
<<<<<<< HEAD
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
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <History className="w-7 h-7 text-brand-600" />
              Interview History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review completed sessions, transcripts, and score improvements over time.
            </p>
          </div>

          <Link href="/setup">
            <Button className="gap-2 self-start sm:self-auto">
              <PlayCircle className="w-4 h-4" />
              Start New Interview
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Loading interview history...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No mock sessions completed yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
                Take your first simulated interview to generate STAR competency scores and personalized feedback.
              </p>
            </div>
            <Link href="/setup">
              <Button size="md" className="gap-2">
                <PlayCircle className="w-4 h-4" />
                Start Your First Interview
              </Button>
            </Link>
          </div>
=======
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      const data = await interviewService.getRecentInterviews(user?.uid);
      setSessions(data);
      setLoading(false);
    }
    loadSessions();
  }, [user]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <HistoryIcon className="w-7 h-7 text-brand-600" />
              Interview History
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Review past mock interview transcripts, question-by-question evaluations, and preparation gaps.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            Loading interview history...
          </div>
>>>>>>> origin/main
        ) : (
          <RecentInterviewsTable sessions={sessions} />
        )}
      </div>
    </AppShell>
  );
}
