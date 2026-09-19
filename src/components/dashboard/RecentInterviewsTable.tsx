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
    <div className="glass-primary rounded-[32px] p-6 sm:p-7 relative overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between pb-5 mb-4 border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="glass-icon-bubble w-9 h-9 text-blue-600">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Recent Interview Attempts
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Evaluated sessions & performance telemetry
            </p>
          </div>
        </div>
        <Link
          href="/interviews/history"
          className="glass-capsule px-3.5 py-1.5 text-xs font-extrabold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-all hover:border-blue-300/80 shadow-xs active:scale-95"
        >
          <span>View all history</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="p-10 text-center text-slate-500 space-y-3 rounded-2xl bg-white/20 border border-white/50 backdrop-blur-sm">
          <p className="text-sm font-semibold">No interview attempts recorded yet.</p>
          <Link
            href="/interviews/setup"
            className="glass-button-primary px-5 py-2 text-xs font-bold gap-1.5 inline-flex items-center"
          >
            <PlayCircle className="w-4 h-4" />
            Start Your First Mock Interview
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/50 bg-white/20 backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/40 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-white/30">
                <th className="py-3.5 px-6">DATE</th>
                <th className="py-3.5 px-6">ROLE & COMPANY</th>
                <th className="py-3.5 px-6">TYPE</th>
                <th className="py-3.5 px-6">DIFFICULTY</th>
                <th className="py-3.5 px-6">SCORE</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-white/45 hover:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.95),0_4px_12px_rgba(15,23,42,0.03)] border-b border-white/25 last:border-0 transition-all duration-200 group cursor-pointer"
                >
                  <td className="py-4 px-6 text-slate-700 font-medium text-xs">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-extrabold text-slate-900 text-xs tracking-tight">{session.config.targetRole}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{session.config.companyType}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold text-slate-800 bg-white/60 border border-white/95 shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_2px_6px_rgba(15,23,42,0.03)] backdrop-blur-md transition-all group-hover:border-blue-300/60 group-hover:text-blue-900">
                      {session.config.interviewType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-xs font-semibold capitalize">
                    {session.config.difficulty}
                  </td>
                  <td className="py-4 px-6">
                    {session.score !== undefined ? (
                      <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-xl bg-white/45 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                        <span className="font-black text-slate-900 text-xs">{session.score.toFixed(1)}</span>
                        <span className="text-slate-400 text-[10px] font-bold">/ 10</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic font-medium">In progress</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/history/${session.id}`}
                      className="glass-button-secondary !py-1.5 !px-3.5 !text-xs !font-extrabold !text-blue-700 inline-flex items-center gap-1.5 shadow-xs hover:!border-blue-300/80 active:scale-95"
                    >
                      <span>Review Transcript</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
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
