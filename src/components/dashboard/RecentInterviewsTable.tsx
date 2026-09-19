import React from "react";
import Link from "next/link";
import { InterviewSession } from "@/types/interview";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight, PlayCircle } from "lucide-react";

interface RecentInterviewsTableProps {
  sessions: InterviewSession[];
}

export function RecentInterviewsTable({ sessions }: RecentInterviewsTableProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base font-semibold text-gray-900">
          Recent Interview Attempts
        </CardTitle>
        <Link
          href="/history"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          View all history
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-3">
            <p className="text-sm">No interview attempts recorded yet.</p>
            <Link href="/setup" className="inline-block">
              <Button size="sm" className="gap-1.5">
                <PlayCircle className="w-3.5 h-3.5" />
                Start Your First Mock Interview
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Role & Company</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Difficulty</th>
                  <th className="py-3 px-6 text-right">Score</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {formatDate(session.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{session.config.targetRole}</p>
                      <p className="text-xs text-gray-500">{session.config.companyType}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      <Badge variant="neutral" size="sm">
                        {session.config.interviewType}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      <span className="text-xs font-medium text-gray-600">
                        {session.config.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {session.score !== undefined ? (
                        <span className="font-bold text-gray-900 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs">
                          {session.score.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">In progress</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/history/${session.id}`}
                        className="text-xs text-brand-600 font-bold hover:text-brand-800 hover:underline inline-flex items-center gap-0.5"
                      >
                        Review Transcript
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
