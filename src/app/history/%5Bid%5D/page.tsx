"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { interviewService } from "@/services/interview.service";
import { InterviewSession } from "@/types/interview";
import { Evaluation } from "@/types/evaluation";
import {
  FileText,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  User,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const s = await interviewService.getInterviewById(id);
        setSession(s);
        const e = await interviewService.getEvaluation(id);
        setEvaluation(e);
      } catch (err) {
        console.warn("Error loading session details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-slate-500">
          Loading interview transcript & feedback...
        </div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell>
        <div className="text-center py-12 space-y-4">
          <p className="text-slate-600">Session not found.</p>
          <Link href="/history">
            <Button variant="outline">Back to History</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const durationMin = Math.max(1, Math.round((session.timeElapsedSeconds || 300) / 60));
  const formattedDate = new Date(session.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Interview History
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-600" />
                Session Q&A Transcript
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {session.config.targetRole} • {session.config.companyType} ({session.config.difficulty})
              </p>
            </div>

            {session.score && (
              <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-4 py-2 self-start sm:self-auto">
                <Award className="w-5 h-5 text-brand-600" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-700 block leading-tight">
                    Final Score
                  </span>
                  <span className="text-lg font-black text-brand-900">
                    {session.score.toFixed(1)} / 10
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 block font-medium">Date</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 block font-medium">Duration</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              ~{durationMin} min
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 block font-medium">Questions</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {session.answers.length} answered
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 block font-medium">Mode</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {session.config.mode || "Text"}
            </span>
          </div>
        </div>

        {/* Turn-by-Turn Q&A Exchange */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Turn-by-Turn Interview Flow</h2>

          {session.questions.map((q, idx) => {
            const answer = session.answers[idx];
            return (
              <Card key={q.id} className="border-slate-200 overflow-hidden shadow-xs">
                {/* Question Header */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      Turn {idx + 1} of {session.questions.length}
                    </span>
                    <Badge variant={q.isFollowUp ? "warning" : "neutral"} size="sm">
                      {q.isFollowUp ? "Adaptive Follow-up" : q.category || "Core Question"}
                    </Badge>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900">
                    &ldquo;{q.text}&rdquo;
                  </p>
                </div>

                {/* Candidate Answer */}
                <div className="p-4 sm:p-5 space-y-2 bg-white">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Candidate Response
                    </span>
                    {answer && (
                      <span className="font-mono text-slate-400">
                        {answer.text.split(/\s+/).filter(Boolean).length} words
                      </span>
                    )}
                  </div>

                  {answer ? (
                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                      {answer.text}
                    </p>
                  ) : (
                    <p className="text-xs italic text-slate-400">No response recorded for this question.</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Structured Evaluation Summary */}
        {evaluation && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold text-slate-900">STAR Competency Feedback</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-emerald-200 bg-emerald-50/30 p-4">
                <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Demonstrated Strengths
                </h3>
                <ul className="space-y-1.5">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-emerald-950 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="border-amber-200 bg-amber-50/30 p-4">
                <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Areas to Improve
                </h3>
                <ul className="space-y-1.5">
                  {evaluation.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-amber-950 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Link href="/history">
            <Button variant="outline">Back to History</Button>
          </Link>
          <Link href="/setup">
            <Button className="gap-2">Practice Another Interview →</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
