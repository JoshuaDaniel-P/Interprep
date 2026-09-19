import React from "react";
import Link from "next/link";
import { InterviewSession } from "@/types/interview";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Clock, PlayCircle } from "lucide-react";

interface RecentInterviewsTableProps {
  sessions: InterviewSession[];
}

export function RecentInterviewsTable({ sessions }: RecentInterviewsTableProps) {
  return (
    <div className="mockup-glass-card overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 mockup-icon-circle text-blue-600">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Recent Interview Attempts
          </h3>
        </div>
        <Link
          href="/interviews/history"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          View all history
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="p-8 text-center text-slate-500 space-y-3">
          <p className="text-sm font-semibold">No interview attempts recorded yet.</p>
          <Link
            href="/interviews/setup"
            className="mockup-btn-primary px-5 py-2 text-xs font-bold gap-1.5 inline-flex items-center"
          >
            <PlayCircle className="w-4 h-4" />
            Start Your First Mock Interview
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">DATE</th>
                <th className="py-3 px-6">ROLE & COMPANY</th>
                <th className="py-3 px-6">TYPE</th>
                <th className="py-3 px-6">DIFFICULTY</th>
                <th className="py-3 px-6">SCORE</th>
                <th className="py-3 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-white/40 transition-colors duration-150 group cursor-pointer"
                >
                  <td className="py-4 px-6 text-slate-700 font-medium text-xs">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 text-xs">{session.config.targetRole}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{session.config.companyType}</p>
                  </td>
                  <td className="py-4 px-6">
                    {/* Mockup Pill Badge */}
                    <span className="mockup-table-pill">
                      {session.config.interviewType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-xs font-medium capitalize">
                    {session.config.difficulty}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900 text-xs">
                    {session.score !== undefined ? (
                      <span>
                        {session.score.toFixed(1)} <span className="text-slate-400 font-normal">/ 10</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">In progress</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/history/${session.id}`}
                      className="text-xs text-blue-600 font-bold hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
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
    </div>
  );
}
