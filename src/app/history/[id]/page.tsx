import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { interviewService } from "@/services/interview.service";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

interface HistoryDetailPageProps {
  params: {
    id: string;
  };
}

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const session = await interviewService.getInterviewById(params.id);

  if (!session) {
    notFound();
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Session Details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {session.config.targetRole} • {session.config.interviewType} • {session.config.difficulty}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              Session Transcript & Performance Review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">
              Detailed transcript view will be populated in Phase 10 & 11.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
