"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Evaluation } from "@/types/evaluation";
import { mockEvaluationDetails } from "@/data/mock/interview.mock";
import { interviewService } from "@/services/interview.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CheckCircle2, AlertCircle, Lightbulb, PlayCircle, History, Award } from "lucide-react";

export function ResultsEvaluationView() {
  const [evaluation, setEvaluation] = useState<Evaluation>(mockEvaluationDetails["session-101"]);

  useEffect(() => {
    async function loadResults() {
      const result = await interviewService.getEvaluation("session-101");
      if (result) {
        setEvaluation(result);
      }
    }
    loadResults();
  }, []);

  const skills = [
    { label: "Content", score: evaluation.skills.content.score, feedback: evaluation.skills.content.feedback },
    { label: "Structure", score: evaluation.skills.structure.score, feedback: evaluation.skills.structure.feedback },
    { label: "Relevance", score: evaluation.skills.relevance.score, feedback: evaluation.skills.relevance.feedback },
    { label: "Clarity", score: evaluation.skills.clarity.score, feedback: evaluation.skills.clarity.feedback },
    { label: "Confidence", score: evaluation.skills.confidence.score, feedback: evaluation.skills.confidence.feedback },
    { label: "Conciseness", score: evaluation.skills.conciseness.score, feedback: evaluation.skills.conciseness.feedback },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            <Award className="w-3.5 h-3.5" />
            Interview Complete
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Performance Review & Feedback
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured analysis generated across 6 core interview competencies.
          </p>
        </div>

        {/* Overall Score Dial */}
        <div className="text-center sm:text-right bg-brand-50/50 border border-brand-200 rounded-2xl p-6 min-w-[180px]">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
            Overall Score
          </span>
          <div className="text-4xl font-black text-brand-900 mt-1">
            {evaluation.overallScore.toFixed(1)}
            <span className="text-lg text-brand-600 font-semibold"> / 10</span>
          </div>
        </div>
      </div>

      {/* 6 Skill Breakdown Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Skill Breakdown Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <div key={skill.label} className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{skill.label}</span>
                <span className="font-bold text-sm text-brand-700">{skill.score.toFixed(1)} / 10</span>
              </div>
              <ProgressBar
                value={skill.score * 10}
                barClassName={skill.score >= 7.5 ? "bg-emerald-500" : "bg-brand-600"}
              />
              <p className="text-xs text-slate-600 pt-1 leading-relaxed">{skill.feedback}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What You Did Well */}
        <Card className="border-emerald-200/80 bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              What You Did Well
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

      {/* Actionable Recommendations */}
      <Card className="border-brand-200">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brand-600" />
            Recommended for Your Next Attempt
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-3">
          {evaluation.recommendations.map((rec, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-brand-50/60 border border-brand-100 text-xs sm:text-sm text-brand-950 font-medium leading-relaxed">
              {rec}
            </div>
          ))}
        </CardContent>
      </Card>

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
            Practice Again
          </Button>
        </Link>
      </div>
    </div>
  );
}
