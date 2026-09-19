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
    <div className="glass-primary p-6 sm:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="glass-icon-bubble text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              AI Adaptive Interviewer
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Evaluating real-time depth, trade-offs & clarity
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={speakQuestion}
            className={`glass-capsule px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? "bg-amber-100/90 text-amber-900 border-amber-300 animate-pulse"
                : "text-slate-700 hover:text-blue-700"
            }`}
            title={isSpeaking ? "Stop AI Voice" : "Listen to Question (AI Voice)"}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
            <span>{isSpeaking ? "Stop Voice" : "Read Aloud"}</span>
          </button>

          {question.isFollowUp ? (
            <Badge variant="warning" size="sm" className="gap-1 font-bold">
              <CornerDownRight className="w-3 h-3" />
              Adaptive Follow-up
            </Badge>
          ) : (
            <Badge variant="brand" size="sm" className="gap-1 font-bold">
              <Tag className="w-3 h-3" />
              {question.category || getQuestionTypeLabel(question.questionType)}
            </Badge>
          )}

          {question.questionType === "yes_no" && (
            <Badge variant="neutral" size="sm" className="bg-purple-50/90 text-purple-800 border-purple-200/80 font-bold">
              Yes/No
            </Badge>
          )}
        </div>
      </div>

      <div className="pt-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-snug tracking-tight">
          &ldquo;{question.text}&rdquo;
        </h2>
        {question.followUpQuestionRelationship && (
          <p className="text-xs text-blue-700 mt-2.5 font-bold">
            ↳ {question.followUpQuestionRelationship}
          </p>
        )}
      </div>
    </div>
  );
}
