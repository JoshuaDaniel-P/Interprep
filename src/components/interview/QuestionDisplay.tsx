"use client";

import React, { useState, useEffect } from "react";
import { InterviewQuestion } from "@/types/interview";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles, CornerDownRight, Volume2, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface QuestionDisplayProps {
  question: InterviewQuestion;
  autoSpeak?: boolean;
}

export function QuestionDisplay({ question, autoSpeak = false }: QuestionDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    <Card className="border-brand-200/60 shadow-xs">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              AI Interviewer
            </span>
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
              <Badge variant="warning" size="sm" className="gap-1">
                <CornerDownRight className="w-3 h-3" />
                Contextual Follow-up
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                {question.category || "Core Question"}
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
            &ldquo;{question.text}&rdquo;
          </h2>
        </div>
      </CardContent>
    </Card>
  );
}
