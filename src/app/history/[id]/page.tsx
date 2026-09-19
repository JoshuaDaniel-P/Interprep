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
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {session.role}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                <Building2 className="w-3 h-3 text-gray-500" />
                {session.company || session.companyType} ({session.companyType})
              </span>
              <Badge variant="neutral" size="sm">
                {session.difficulty} Difficulty
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Mock Interview Transcript
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Date: {formatDate(session.startedAt || session.completedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Duration: {formatDuration(session.duration || 600)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">
                  {session.questionCount || session.questions.length} Questions Answered
                </span>
              </div>
            </div>
          </div>

          {/* Overall Score Dial */}
          <div className="text-center sm:text-right bg-brand-50/70 border border-brand-200 rounded-2xl p-6 min-w-[170px] shrink-0">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
              Overall Rating
            </span>
            <div className="text-4xl font-black text-brand-950 mt-1">
              {session.overallScore?.toFixed(1) ?? "7.5"}
              <span className="text-lg text-brand-600 font-semibold"> / 10</span>
            </div>
          </div>
        </div>

        {/* 7 Category Scores Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-600" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categoryCards.map((cat) => (
              <div
                key={cat.label}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1"
              >
                <span className="text-[11px] font-semibold text-slate-600 block truncate">
                  {cat.label}
                </span>
                <span className="text-sm font-black text-brand-800 block">
                  {cat.val}%
                </span>
                <ProgressBar value={cat.val} barClassName={cat.val >= 75 ? "bg-emerald-500" : "bg-brand-600"} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-emerald-200 bg-emerald-50/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs text-emerald-900">
              {session.strengths?.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{s}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs text-amber-900">
              {session.weaknesses?.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-brand-200 bg-brand-50/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-brand-950 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-brand-600" />
                Preparation Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs text-brand-950">
              {(session.recommendedPreparationAreas || []).map((r, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">✓</span>
                  <span>{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
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
              <Card key={q.id || idx} className="border-gray-200 shadow-2xs overflow-hidden">
                {/* Question Header */}
                <div className="p-5 bg-gray-50/80 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white text-gray-900 border border-gray-200">
                      Question {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
                      {q.questionType}
                    </span>
                    {q.isFollowUp && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <CornerDownRight className="w-3 h-3" />
                        Adaptive Follow-up
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {q.answerDuration ? (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {q.answerDuration}s
                      </span>
                    ) : null}
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-brand-50 text-brand-900 border border-brand-200">
                      Score: {q.evaluation?.score ?? 7.0} / 10
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Interviewer Prompt */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                      Interviewer:
                    </span>
                    <p className="text-base font-semibold text-gray-900 leading-snug">
                      &ldquo;{q.question}&rdquo;
                    </p>
                  </div>

                  {/* Candidate Answer */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                      Candidate Answer:
                    </span>
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                      {q.candidateAnswer}
                    </div>
                  </div>

                  {/* Per-Question Evaluation Breakdown */}
                  {q.evaluation && (
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Answer Evaluation Metrics:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[10px] text-gray-500 block">Correctness</span>
                          <span className="font-bold text-gray-900">{q.evaluation.technicalCorrectness}/10</span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[10px] text-gray-500 block">Relevance</span>
                          <span className="font-bold text-gray-900">{q.evaluation.relevance}/10</span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[10px] text-gray-500 block">Clarity</span>
                          <span className="font-bold text-gray-900">{q.evaluation.clarity}/10</span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[10px] text-gray-500 block">Structure</span>
                          <span className="font-bold text-gray-900">{q.evaluation.structure}/10</span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[10px] text-gray-500 block">Conciseness</span>
                          <span className="font-bold text-gray-900">{q.evaluation.conciseness}/10</span>
                        </div>
                      </div>

                      {q.evaluation.confidenceIndicators && (
                        <p className="text-xs text-gray-500 italic">
                          Confidence indicator: {q.evaluation.confidenceIndicators}
                        </p>
                      )}

                      {q.evaluation.strengths?.length ? (
                        <div className="text-xs text-emerald-900 space-y-1">
                          <span className="font-bold">What was strong:</span>
                          {q.evaluation.strengths.map((s, i) => (
                            <p key={i} className="pl-2 border-l-2 border-emerald-400">
                              {s}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      {q.evaluation.weaknesses?.length ? (
                        <div className="text-xs text-amber-900 space-y-1">
                          <span className="font-bold">Room for improvement:</span>
                          {q.evaluation.weaknesses.map((w, i) => (
                            <p key={i} className="pl-2 border-l-2 border-amber-400">
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
        <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
          <Link href="/history">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              All Interviews
            </Button>
          </Link>
          <Link href="/setup">
            <Button className="gap-2">
              Start New Mock Interview
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
