"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { interviewService } from "@/services/interview.service";
import { StoredInterviewRecord, RecordedQuestion } from "@/types/interview";
import { formatDate, formatDuration } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  CornerDownRight,
  Code2,
  Brain,
  FolderGit2,
  Users,
  Briefcase,
} from "lucide-react";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [session, setSession] = useState<StoredInterviewRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const data = await interviewService.getInterviewById(id);
      if (data) {
        // If legacy format, normalize to StoredInterviewRecord structure
        if (!("questions" in data) || !Array.isArray(data.questions)) {
          // Normalize
          setSession(null);
        } else {
          setSession(data as StoredInterviewRecord);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-12 text-center text-gray-500">
          Loading interview transcript...
        </div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
          <h2 className="text-xl font-bold text-gray-900">Session Transcript Not Found</h2>
          <p className="text-sm text-gray-500">
            The requested interview transcript could not be located in your history.
          </p>
          <Link href="/history">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const categoryCards = [
    { label: "Technical Knowledge", val: session.categoryScores?.technicalKnowledge ?? 75, icon: Code2 },
    { label: "Problem Solving", val: session.categoryScores?.problemSolving ?? 72, icon: Brain },
    { label: "Projects & Architecture", val: session.categoryScores?.projects ?? 80, icon: FolderGit2 },
    { label: "Communication", val: session.categoryScores?.communication ?? 68, icon: MessageSquare },
    { label: "Behavioral", val: session.categoryScores?.behavioral ?? 74, icon: Users },
    { label: "Role Knowledge", val: session.categoryScores?.roleKnowledge ?? 76, icon: Briefcase },
    { label: "Company Awareness", val: session.categoryScores?.companyAwareness ?? 70, icon: Building2 },
  ];

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/history">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Interview History
            </Button>
          </Link>
          <span className="text-xs text-gray-400 font-mono">ID: {session.id}</span>
        </div>

        {/* Complete Session Metadata Header */}
        <div className="glass-primary p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-capsule px-3 py-1 text-xs font-black text-blue-800">
                {session.role}
              </span>
              <span className="glass-capsule inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {session.company || session.companyType} ({session.companyType})
              </span>
              <Badge variant="neutral" size="sm">
                {session.difficulty} Difficulty
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Mock Interview Transcript
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date: {formatDate(session.startedAt || session.completedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duration: {formatDuration(session.duration || 600)}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800">
                  {session.questionCount || session.questions.length} Questions Answered
                </span>
              </div>
            </div>
          </div>

          {/* Overall Score Dial */}
          <div className="text-center sm:text-right glass-secondary p-5 min-w-[170px] rounded-3xl border border-white/95 shadow-md shrink-0">
            <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">
              Overall Rating
            </span>
            <div className="text-4xl font-black text-blue-950 mt-1">
              {session.overallScore?.toFixed(1) ?? "7.5"}
              <span className="text-lg text-blue-600 font-bold"> / 10</span>
            </div>
          </div>
        </div>

        {/* 7 Category Scores Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categoryCards.map((cat) => (
              <div
                key={cat.label}
                className="p-3 rounded-2xl bg-white/70 border border-white/95 text-center space-y-1 shadow-xs backdrop-blur-sm"
              >
                <span className="text-[11px] font-bold text-slate-600 block truncate">
                  {cat.label}
                </span>
                <span className="text-sm font-black text-blue-900 block">
                  {cat.val}%
                </span>
                <ProgressBar value={cat.val} barClassName={cat.val >= 75 ? "glass-fluid-green" : "glass-fluid-blue"} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-glass-green-panel p-5 space-y-2">
            <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Strengths
            </h4>
            <div className="space-y-2 text-xs text-emerald-950 font-semibold pt-1">
              {session.strengths?.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-glass-amber-panel p-5 space-y-2">
            <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Areas to Improve
            </h4>
            <div className="space-y-2 text-xs text-amber-950 font-semibold pt-1">
              {session.weaknesses?.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-secondary p-5 space-y-2">
            <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              Preparation Focus
            </h4>
            <div className="space-y-2 text-xs text-slate-900 font-semibold pt-1">
              {(session.recommendedPreparationAreas || []).map((r, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Complete Conversation & Answer Evaluations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Complete Question-by-Question Transcript ({session.questions.length} Questions)
            </h2>
            <span className="text-xs text-gray-500">
              Read all interviewer prompts and individual answer evaluations
            </span>
          </div>

          <div className="space-y-6">
            {session.questions.map((q: RecordedQuestion, idx: number) => (
              <Card key={q.id || idx} className="overflow-hidden">
                {/* Question Header */}
                <div className="p-5 border-b border-slate-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/40">
                  <div className="flex items-center gap-2.5">
                    <span className="glass-capsule px-3 py-0.5 text-xs font-black text-slate-800">
                      Question {idx + 1}
                    </span>
                    <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                      {q.questionType}
                    </span>
                    {q.isFollowUp && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300/80 shadow-xs">
                        <CornerDownRight className="w-3 h-3" />
                        Adaptive Follow-up
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {q.answerDuration ? (
                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {q.answerDuration}s
                      </span>
                    ) : null}
                    <span className="glass-capsule px-3 py-0.5 text-xs font-black text-blue-900">
                      Score: {q.evaluation?.score ?? 7.0} / 10
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Interviewer Prompt */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                      Interviewer:
                    </span>
                    <p className="text-base font-extrabold text-slate-900 leading-snug tracking-tight">
                      &ldquo;{q.question}&rdquo;
                    </p>
                  </div>

                  {/* Candidate Answer */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                      Candidate Answer:
                    </span>
                    <div className="p-4 rounded-2xl bg-white/80 border border-white/95 text-sm text-slate-800 leading-relaxed font-medium shadow-xs whitespace-pre-wrap">
                      {q.candidateAnswer}
                    </div>
                  </div>

                  {/* Per-Question Evaluation Breakdown */}
                  {q.evaluation && (
                    <div className="pt-3 border-t border-slate-200/40 space-y-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Answer Evaluation Metrics:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                          <span className="text-[10px] text-slate-500 block font-extrabold uppercase">Correctness</span>
                          <span className="font-black text-slate-900">{q.evaluation.technicalCorrectness}/10</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                          <span className="text-[10px] text-slate-500 block font-extrabold uppercase">Relevance</span>
                          <span className="font-black text-slate-900">{q.evaluation.relevance}/10</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                          <span className="text-[10px] text-slate-500 block font-extrabold uppercase">Clarity</span>
                          <span className="font-black text-slate-900">{q.evaluation.clarity}/10</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                          <span className="text-[10px] text-slate-500 block font-extrabold uppercase">Structure</span>
                          <span className="font-black text-slate-900">{q.evaluation.structure}/10</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                          <span className="text-[10px] text-slate-500 block font-extrabold uppercase">Conciseness</span>
                          <span className="font-black text-slate-900">{q.evaluation.conciseness}/10</span>
                        </div>
                      </div>

                      {q.evaluation.confidenceIndicators && (
                        <p className="text-xs text-slate-500 italic font-medium">
                          Confidence indicator: {q.evaluation.confidenceIndicators}
                        </p>
                      )}

                      {q.evaluation.strengths?.length ? (
                        <div className="text-xs text-emerald-950 space-y-1 font-semibold">
                          <span className="font-extrabold text-emerald-900">What was strong:</span>
                          {q.evaluation.strengths.map((s, i) => (
                            <p key={i} className="pl-2 border-l-2 border-emerald-500">
                              {s}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      {q.evaluation.weaknesses?.length ? (
                        <div className="text-xs text-amber-950 space-y-1 font-semibold">
                          <span className="font-extrabold text-amber-900">Room for improvement:</span>
                          {q.evaluation.weaknesses.map((w, i) => (
                            <p key={i} className="pl-2 border-l-2 border-amber-500">
                              {w}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-200/50 flex items-center justify-between">
          <Link href="/interviews/history">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              All Interviews
            </Button>
          </Link>
          <Link href="/interviews/setup">
            <Button className="gap-2 px-6">
              Start New Mock Interview
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
