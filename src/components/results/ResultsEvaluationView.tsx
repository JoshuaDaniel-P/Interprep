"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Evaluation } from "@/types/evaluation";
import { InterviewSession, StoredInterviewRecord, RecordedQuestion } from "@/types/interview";
import { interviewService } from "@/services/interview.service";
import { mockEvaluationDetails } from "@/data/mock/interview.mock";
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
  FileText,
} from "lucide-react";

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "session-101";

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [session, setSession] = useState<InterviewSession | StoredInterviewRecord | null>(null);
  const [sessionRecord, setSessionRecord] = useState<StoredInterviewRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    async function loadResults() {
      setIsLoading(true);
      try {
        let loadedEval: Evaluation | null = null;
        let loadedSession: InterviewSession | StoredInterviewRecord | null = null;

        // 1. Try session/local storage first with sessionId
        if (typeof window !== "undefined") {
          const evalKey = `preppilot_eval_${sessionId}`;
          const specificEvalStr = sessionStorage.getItem(evalKey) || localStorage.getItem(evalKey);
          if (specificEvalStr) {
            try {
              loadedEval = JSON.parse(specificEvalStr);
            } catch {}
          }

          const activeEvalStr = sessionStorage.getItem("preppilot_active_evaluation");
          if (!loadedEval && activeEvalStr) {
            try {
              loadedEval = JSON.parse(activeEvalStr);
            } catch {}
          }

          const activeSessionStr =
            sessionStorage.getItem("preppilot_completed_session") ||
            localStorage.getItem("preppilot_last_completed_session");
          if (activeSessionStr) {
            try {
              const parsed = JSON.parse(activeSessionStr);
              loadedSession = parsed;
              setSessionRecord(parsed);
              if (!loadedEval && parsed.evaluation) {
                loadedEval = parsed.evaluation;
              }
            } catch {}
          }
        }

        // 2. Load from service (Firestore or cached)
        const [evalResult, sessionResult] = await Promise.all([
          interviewService.getEvaluation(sessionId).catch(() => null),
          interviewService.getInterviewById(sessionId).catch(() => null),
        ]);

        if (evalResult) {
          loadedEval = evalResult;
        }
        if (sessionResult) {
          loadedSession = sessionResult;
        }

        // 3. Fallback mock ONLY if sessionId is explicitly mock session-101 and no real eval exists
        if (!loadedEval && (sessionId === "session-101" || mockEvaluationDetails[sessionId])) {
          loadedEval = mockEvaluationDetails[sessionId] || mockEvaluationDetails["session-101"];
        }

        if (loadedEval) {
          setEvaluation(loadedEval);
        }
        if (loadedSession) {
          setSession(loadedSession);
        }
      } catch (err) {
        console.warn("Failed to load evaluation details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, [sessionId]);

  if (isLoading && !evaluation) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-slate-100 rounded w-1/4 mx-auto"></div>
          <p className="text-sm">Loading comprehensive performance evaluation...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-12 text-center text-slate-600 max-w-lg mx-auto bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">No Evaluation Report Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          Could not retrieve evaluation results for session ID: <code className="text-brand-600">{sessionId}</code>.
        </p>
        <Link href="/setup">
          <Button>Start a New Interview</Button>
        </Link>
      </div>
    );
  }

  // Determine questions list
  const questionsList: RecordedQuestion[] =
    evaluation.questions ||
    sessionRecord?.questions ||
    (session as StoredInterviewRecord)?.questions ||
    (session as InterviewSession)?.recordedQuestions ||
    [];

  const overallPct = evaluation ? Math.round(evaluation.overallScore * 10) : 50;

  // 7 Core Categories
  const categories = [
    {
      label: "Technical Knowledge",
      score: evaluation.categoryScores?.technicalKnowledge ?? overallPct,
      icon: Code2,
      desc: "Core domain logic, data models, language runtime, and API patterns.",
    },
    {
      label: "Problem Solving",
      score: evaluation.categoryScores?.problemSolving ?? overallPct,
      icon: Brain,
      desc: "System decomposition, edge-case consideration, and debugging reasoning.",
    },
    {
      label: "Projects & Architecture",
      score: evaluation.categoryScores?.projects ?? overallPct,
      icon: FolderGit2,
      desc: "Depth in discussing owned projects, tradeoffs, and scaling decisions.",
    },
    {
      label: "Communication",
      score: evaluation.categoryScores?.communication ?? overallPct,
      icon: MessageSquare,
      desc: "Clarity, concise explanations, and terminology precision.",
    },
    {
      label: "Behavioral & STAR",
      score: evaluation.categoryScores?.behavioral ?? overallPct,
      icon: Users,
      desc: "Teamwork, conflict resolution, ownership, and structured STAR answers.",
    },
    {
      label: "Role Knowledge",
      score: evaluation.categoryScores?.roleKnowledge ?? overallPct,
      icon: Briefcase,
      desc: "Awareness of day-to-day responsibilities, tooling, and best practices.",
    },
    {
      label: "Company Awareness",
      score: evaluation.categoryScores?.companyAwareness ?? overallPct,
      icon: Building2,
      desc: "Understanding of company challenges, scale, and organizational fit.",
    },
  ];

  // 6 STAR / Competency Skills fallback or complement
  const skills = evaluation.skills
    ? [
        { label: "Content", score: evaluation.skills.content.score, feedback: evaluation.skills.content.feedback },
        { label: "Structure (STAR)", score: evaluation.skills.structure.score, feedback: evaluation.skills.structure.feedback },
        { label: "Relevance", score: evaluation.skills.relevance.score, feedback: evaluation.skills.relevance.feedback },
        { label: "Clarity", score: evaluation.skills.clarity.score, feedback: evaluation.skills.clarity.feedback },
        { label: "Confidence", score: evaluation.skills.confidence.score, feedback: evaluation.skills.confidence.feedback },
        { label: "Conciseness", score: evaluation.skills.conciseness.score, feedback: evaluation.skills.conciseness.feedback },
      ]
    : [];

  const roleText =
    (session as InterviewSession)?.config?.targetRole ||
    (session as StoredInterviewRecord)?.role ||
    sessionRecord?.role ||
    "Software Engineer";

  const companyText =
    (session as InterviewSession)?.config?.company ||
    (session as InterviewSession)?.config?.companyType ||
    (session as StoredInterviewRecord)?.company ||
    (session as StoredInterviewRecord)?.companyType ||
    sessionRecord?.company ||
    sessionRecord?.companyType ||
    "Tech Company";

  const difficultyText =
    (session as InterviewSession)?.config?.difficulty ||
    (session as StoredInterviewRecord)?.difficulty ||
    sessionRecord?.difficulty ||
    "Realistic";

  const completedCount =
    questionsList.length ||
    (session as InterviewSession)?.answers?.length ||
    (session as StoredInterviewRecord)?.questionCount ||
    sessionRecord?.questionCount ||
    0;

  const recommendations =
    evaluation.recommendedPreparationAreas ||
    evaluation.recommendations ||
    [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Overview Banner */}
      <div className="glass-primary p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-800 border border-emerald-400/40 mb-1 shadow-xs backdrop-blur-sm">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Interview Complete & Evaluated
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Performance Review & Gap Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            <span>
              {roleText} • {companyText} ({difficultyText}) • {completedCount} Questions Completed
            </span>
          </p>
        </div>

        {/* Overall Score Dial */}
        <div className="text-center sm:text-right glass-secondary p-6 min-w-[180px] rounded-3xl border border-white/95 shadow-md">
          <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">
            Overall Score
          </span>
          <div className="text-4xl font-black text-blue-950 mt-1">
            {evaluation.overallScore.toFixed(1)}
            <span className="text-lg text-blue-600 font-bold"> / 10</span>
          </div>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            {questionsList.length > 0 ? `${questionsList.length} Questions Evaluated` : "Complete Mock Session"}
          </span>
        </div>
      </div>

      {/* 7 Category Scores Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-extrabold text-slate-900">
            Assessment Across 7 Core Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className="space-y-2.5 p-4 rounded-2xl bg-white/70 border border-white/95 shadow-xs flex flex-col justify-between backdrop-blur-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-blue-50/90 text-blue-700 border border-blue-200/80 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">{cat.label}</span>
                    </div>
                    <span className="font-black text-xs text-blue-700">{cat.score}%</span>
                  </div>
                  <ProgressBar
                    value={cat.score}
                    barClassName={cat.score >= 75 ? "glass-fluid-green" : "glass-fluid-blue"}
                  />
                </div>
                <p className="text-[11px] text-slate-500 pt-2 leading-relaxed font-medium">
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 6 STAR Competencies if available */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-slate-900">
              STAR & Core Competencies Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.label}
                className="p-4 rounded-2xl bg-white/70 border border-white/95 shadow-xs space-y-2 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">{skill.label}</span>
                  <span className="text-xs font-black text-blue-700">{skill.score} / 10</span>
                </div>
                <ProgressBar value={skill.score * 10} barClassName="glass-fluid-blue" />
                <p className="text-[11px] text-slate-600 pt-1 leading-relaxed font-medium">{skill.feedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Preparation Areas */}
      {recommendations.length > 0 && (
        <Card className="border-blue-200/80">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Recommended Preparation Areas (What to Focus On)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/80 border border-white/95 text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed flex items-start gap-2.5 shadow-xs"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Observed Strengths */}
        <div className="liquid-glass-green-panel p-6 space-y-3">
          <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Observed Strengths
          </h3>
          <div className="space-y-3 pt-1">
            {evaluation.strengths.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow-xs" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas to Improve */}
        <div className="liquid-glass-amber-panel p-6 space-y-3">
          <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Areas to Improve
          </h3>
          <div className="space-y-3 pt-1">
            {evaluation.improvements.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5 shadow-xs" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Insights: Recurring Issues & Identified Gaps */}
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
                  className="rounded-2xl border border-white/95 bg-white/75 backdrop-blur-sm overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                    className="w-full p-4.5 text-left flex items-start justify-between gap-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/90 text-slate-800 border border-white/95 shadow-xs">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                          {q.questionType}
                        </span>
                        {q.isFollowUp && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/80 text-amber-900 border border-amber-300/80 shadow-xs">
                            Follow-up
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 pt-0.5 tracking-tight">
                        {q.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-black text-xs bg-blue-50/90 text-blue-900 px-3 py-1 rounded-full border border-blue-200/80 shadow-xs">
                        {q.evaluation?.score ?? evaluation.overallScore ?? 5.0} / 10
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-200/40 bg-white/40 space-y-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-extrabold text-slate-800 block mb-1">
                          Candidate Answer:
                        </span>
                        <div className="p-4 rounded-xl bg-white/90 border border-white/95 text-slate-800 leading-relaxed font-medium shadow-2xs">
                          {q.candidateAnswer || "No answer provided"}
                        </div>
                      </div>

                      {q.evaluation && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center font-bold">
                          <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                            <span className="text-[10px] text-slate-500 block uppercase font-extrabold">Correctness</span>
                            <span className="text-slate-900 text-xs font-black">{q.evaluation.technicalCorrectness}/10</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                            <span className="text-[10px] text-slate-500 block uppercase font-extrabold">Relevance</span>
                            <span className="text-slate-900 text-xs font-black">{q.evaluation.relevance}/10</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                            <span className="text-[10px] text-slate-500 block uppercase font-extrabold">Clarity</span>
                            <span className="text-slate-900 text-xs font-black">{q.evaluation.clarity}/10</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                            <span className="text-[10px] text-slate-500 block uppercase font-extrabold">Structure</span>
                            <span className="text-slate-900 text-xs font-black">{q.evaluation.structure}/10</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/80 border border-white/95 shadow-xs">
                            <span className="text-[10px] text-slate-500 block uppercase font-extrabold">Conciseness</span>
                            <span className="text-slate-900 text-xs font-black">{q.evaluation.conciseness}/10</span>
                          </div>
                        </div>
                      )}

                      {q.evaluation?.strengths?.length ? (
                        <div className="text-emerald-950 text-xs space-y-1 font-semibold">
                          <span className="font-extrabold block text-emerald-900">Question Strengths:</span>
                          {q.evaluation.strengths.map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {q.evaluation?.weaknesses?.length ? (
                        <div className="text-amber-950 text-xs space-y-1 font-semibold">
                          <span className="font-extrabold block text-amber-900">Areas to Improve:</span>
                          {q.evaluation.weaknesses.map((w, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="text-amber-500 font-bold">•</span>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/50">
        <Link href={`/history/${sessionId}`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" />
            View Full Q&A Transcript
          </Button>
        </Link>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/interviews/history" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2">
              <History className="w-4 h-4" />
              Session History
            </Button>
          </Link>
          <Link href="/interviews/setup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 px-8">
              <PlayCircle className="w-5 h-5" />
              Practice Another
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ResultsEvaluationView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading interview evaluation...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
