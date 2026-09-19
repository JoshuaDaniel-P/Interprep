"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Evaluation } from "@/types/evaluation";
import { StoredInterviewRecord, RecordedQuestion } from "@/types/interview";
import { interviewService } from "@/services/interview.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  PlayCircle,
  History,
  Award,
  ChevronDown,
  ChevronUp,
  Brain,
  Code2,
  FolderGit2,
  MessageSquare,
  Users,
  Briefcase,
  Building2,
  Check,
  AlertTriangle,
} from "lucide-react";

export function ResultsEvaluationView() {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [sessionRecord, setSessionRecord] = useState<StoredInterviewRecord | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    async function loadResults() {
      // 1. Try session storage first
      if (typeof window !== "undefined") {
        const activeEvalStr = sessionStorage.getItem("preppilot_active_evaluation");
        const activeSessionStr = sessionStorage.getItem("preppilot_completed_session");
        if (activeEvalStr) {
          try {
            setEvaluation(JSON.parse(activeEvalStr));
          } catch {}
        }
        if (activeSessionStr) {
          try {
            setSessionRecord(JSON.parse(activeSessionStr));
          } catch {}
        }
      }

      // 2. Fallback to service if not in session storage
      const result = await interviewService.getEvaluation("session-101");
      if (result) {
        setEvaluation((prev) => prev || result);
      }
    }
    loadResults();
  }, []);

  if (!evaluation) {
    return (
      <div className="p-12 text-center text-gray-500">
        Loading evaluation report...
      </div>
    );
  }

  // 7 Required Categories
  const categories = [
    {
      label: "Technical Knowledge",
      score: evaluation.categoryScores?.technicalKnowledge ?? 75,
      icon: Code2,
      desc: "Core domain logic, data models, language runtime, and API patterns.",
    },
    {
      label: "Problem Solving",
      score: evaluation.categoryScores?.problemSolving ?? 72,
      icon: Brain,
      desc: "System decomposition, edge-case consideration, and debugging reasoning.",
    },
    {
      label: "Projects & Architecture",
      score: evaluation.categoryScores?.projects ?? 80,
      icon: FolderGit2,
      desc: "Depth in discussing owned projects, tradeoffs, and scaling decisions.",
    },
    {
      label: "Communication",
      score: evaluation.categoryScores?.communication ?? 68,
      icon: MessageSquare,
      desc: "Clarity, concise explanations, and terminology precision.",
    },
    {
      label: "Behavioral & STAR",
      score: evaluation.categoryScores?.behavioral ?? 74,
      icon: Users,
      desc: "Teamwork, conflict resolution, ownership, and structured STAR answers.",
    },
    {
      label: "Role Knowledge",
      score: evaluation.categoryScores?.roleKnowledge ?? 76,
      icon: Briefcase,
      desc: "Awareness of day-to-day responsibilities, tooling, and best practices.",
    },
    {
      label: "Company Awareness",
      score: evaluation.categoryScores?.companyAwareness ?? 70,
      icon: Building2,
      desc: "Understanding of company challenges, scale, and organizational fit.",
    },
  ];

  const questionsList: RecordedQuestion[] =
    evaluation.questions || sessionRecord?.questions || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            <Award className="w-3.5 h-3.5" />
            Interview Complete & Evaluated
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Performance Review & Gap Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {sessionRecord ? `${sessionRecord.role} at ${sessionRecord.company} (${sessionRecord.difficulty} Difficulty)` : "Comprehensive adaptive evaluation report across 7 core dimensions."}
          </p>
        </div>

        {/* Overall Score Dial */}
        <div className="text-center sm:text-right bg-brand-50/70 border border-brand-200 rounded-2xl p-6 min-w-[180px] shadow-xs">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
            Overall Score
          </span>
          <div className="text-4xl font-black text-brand-950 mt-1">
            {evaluation.overallScore.toFixed(1)}
            <span className="text-lg text-brand-600 font-semibold"> / 10</span>
          </div>
          <span className="text-[11px] text-brand-800 block mt-1">
            {questionsList.length > 0 ? `${questionsList.length} Questions Evaluated` : "Complete Mock Session"}
          </span>
        </div>
      </div>

      {/* 7 Category Scores Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Assessment Across 7 Core Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">{cat.label}</span>
                    </div>
                    <span className="font-bold text-xs text-brand-700">{cat.score}%</span>
                  </div>
                  <ProgressBar
                    value={cat.score}
                    barClassName={cat.score >= 75 ? "bg-emerald-500" : "bg-brand-600"}
                  />
                </div>
                <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recommended Preparation Areas (Requirement 10: Identify what to prepare, do not teach course) */}
      <Card className="border-brand-300 bg-brand-50/40">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-brand-950 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brand-600" />
            Recommended Preparation Areas (What to Focus On)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-3">
          {(evaluation.recommendedPreparationAreas || evaluation.recommendations).map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white border border-brand-200 text-xs sm:text-sm text-brand-950 font-medium leading-relaxed flex items-start gap-2.5"
            >
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What You Did Well */}
        <Card className="border-emerald-200/80 bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Observed Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {evaluation.strengths.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Areas to Improve */}
        <Card className="border-amber-200/80 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {evaluation.improvements.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-900">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pattern Insights: Recurring Issues & Structure/Technical Gaps */}
      {(evaluation.recurringIssues?.length || evaluation.technicalGaps?.length) ? (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Pattern Analysis: Recurring Issues & Identified Knowledge Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluation.recurringIssues && evaluation.recurringIssues.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recurring Response Patterns
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {evaluation.recurringIssues.map((iss, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{iss}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.technicalGaps && evaluation.technicalGaps.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Identified Technical Gaps
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {evaluation.technicalGaps.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-brand-600 font-bold">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Question-by-Question Detailed Review Accordion */}
      {questionsList.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Question-by-Question Evaluation ({questionsList.length} Questions)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {questionsList.map((q, idx) => {
              const isExpanded = expandedQuestion === idx;
              return (
                <div
                  key={q.id || idx}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                    className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
                          {q.questionType}
                        </span>
                        {q.isFollowUp && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Follow-up
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 pt-0.5">
                        {q.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-xs bg-brand-50 text-brand-800 px-2.5 py-1 rounded-md border border-brand-200">
                        {q.evaluation?.score ?? 7.0} / 10
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">
                          Candidate Answer:
                        </span>
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-slate-800 leading-relaxed">
                          {q.candidateAnswer}
                        </div>
                      </div>

                      {q.evaluation && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center font-semibold">
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 block uppercase">Correctness</span>
                            <span className="text-slate-900 text-xs">{q.evaluation.technicalCorrectness}/10</span>
                          </div>
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 block uppercase">Relevance</span>
                            <span className="text-slate-900 text-xs">{q.evaluation.relevance}/10</span>
                          </div>
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 block uppercase">Clarity</span>
                            <span className="text-slate-900 text-xs">{q.evaluation.clarity}/10</span>
                          </div>
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 block uppercase">Structure</span>
                            <span className="text-slate-900 text-xs">{q.evaluation.structure}/10</span>
                          </div>
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 block uppercase">Conciseness</span>
                            <span className="text-slate-900 text-xs">{q.evaluation.conciseness}/10</span>
                          </div>
                        </div>
                      )}

                      {q.evaluation?.strengths?.length ? (
                        <div className="text-emerald-900 text-xs space-y-1">
                          <span className="font-bold block">Question Strengths:</span>
                          {q.evaluation.strengths.map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="text-emerald-500">•</span>
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {q.evaluation?.weaknesses?.length ? (
                        <div className="text-amber-900 text-xs space-y-1">
                          <span className="font-bold block">Areas to Improve:</span>
                          {q.evaluation.weaknesses.map((w, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="text-amber-500">•</span>
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-200">
        <Link href="/history" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full gap-2">
            <History className="w-4 h-4" />
            View History
          </Button>
        </Link>
        <Link href="/setup" className="w-full sm:w-auto">
          <Button size="lg" className="w-full gap-2 px-8">
            <PlayCircle className="w-5 h-5" />
            Practice Another Interview
          </Button>
        </Link>
      </div>
    </div>
  );
}
