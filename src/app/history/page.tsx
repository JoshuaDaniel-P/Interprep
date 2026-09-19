import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable";
import { interviewService } from "@/services/interview.service";

export const revalidate = 0;

export default async function HistoryPage() {
  const sessions = await interviewService.getRecentInterviews();

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Interview History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review past interview transcripts, scores, and recommendations.
          </p>
        </div>

        <RecentInterviewsTable sessions={sessions} />
      </div>
    </AppShell>
  );
}
