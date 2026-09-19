"use client";

import React, { useState, useEffect } from "react";
import { InterviewQuestion } from "@/types/interview";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles, CornerDownRight, Volume2, VolumeX, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface QuestionDisplayProps {
  question: InterviewQuestion;
  autoSpeak?: boolean;
}

export function QuestionDisplay({ question, autoSpeak = false }: QuestionDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getQuestionTypeLabel = (type?: string) => {
    switch (type) {
      case "project":
        return "Candidate Project Deep Dive";
      case "candidate_specific":
        return "Candidate Specific Question";
      case "yes_no":
        return "Direct Yes/No Screening";
      case "behavioral":
        return "Behavioral Competency (STAR)";
      case "situational":
        return "Situational & Crisis Handling";
      case "problem_solving":
        return "System & Logic Problem Solving";
      case "company_oriented":
        return "Company Alignment & Mission";
      case "short_answer":
        return "Quick Technical Check";
      default:
        return "Core Technical Question";
    }
  };

  const speakQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (autoSpeak) {
      speakQuestion();
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [question.id]);

  return (
    <div
      className="glass liquid-glass-panel p-6 sm:p-8 space-y-4"
      data-config='{"refraction": 0.25, "edgeHighlight": 0.9, "specular": 0.8, "zRadius": 20, "cornerRadius": 28}'
    >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                AI Adaptive Interviewer
              </span>
              <span className="text-[11px] text-gray-500">
                Evaluating real-time depth, trade-offs & clarity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={speakQuestion}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSpeaking
                  ? "bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              title={isSpeaking ? "Stop AI Voice" : "Listen to Question (AI Voice)"}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? "Stop Voice" : "Read Aloud"}</span>
            </button>

            {question.isFollowUp ? (
              <Badge variant="warning" size="sm" className="gap-1 font-semibold">
                <CornerDownRight className="w-3 h-3" />
                Adaptive Follow-up
              </Badge>
            ) : (
              <Badge variant="brand" size="sm" className="gap-1 font-semibold">
                <Tag className="w-3 h-3" />
                {question.category || getQuestionTypeLabel(question.questionType)}
              </Badge>
            )}

            {question.questionType === "yes_no" && (
              <Badge variant="neutral" size="sm" className="bg-purple-50 text-purple-700 border-purple-200">
                Yes/No
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
            &ldquo;{question.text}&rdquo;
          </h2>
          {question.followUpQuestionRelationship && (
            <p className="text-xs text-brand-700 mt-2 font-medium">
              ↳ {question.followUpQuestionRelationship}
            </p>
          )}
        </div>
      </div>
    );
  }
