"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable";
import { interviewService } from "@/services/interview.service";
import { InterviewSession } from "@/types/interview";
import { useAuth } from "@/context/AuthContext";
import { History as HistoryIcon } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
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
        ) : (
          <RecentInterviewsTable sessions={sessions} />
        )}
      </div>
    </AppShell>
  );
}
