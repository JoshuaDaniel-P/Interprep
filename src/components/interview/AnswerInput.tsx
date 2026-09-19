"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Send, Lightbulb, Check, X, RefreshCw, AlertCircle, Award } from "lucide-react";
import { useInterview } from "@/context/InterviewContext";

interface AnswerInputProps {
  onSubmit: (answerText: string) => void;
  isSubmitting?: boolean;
}

export function AnswerInput({ onSubmit, isSubmitting = false }: AnswerInputProps) {
  const {
    currentQuestion,
    currentQuestionIndex,
    errorMessage,
    retryLastAnswer,
    finishEarlyAndEvaluate,
  } = useInterview();

  const [text, setText] = useState("");

  const isYesNoQuestion =
    currentQuestion?.questionType === "yes_no" || !!currentQuestion?.yesNoOptions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    const answer = text.trim();
    onSubmit(answer);
    setText("");
  };

  const handleQuickYesNo = (val: "Yes" | "No") => {
    if (isSubmitting) return;
    onSubmit(val);
    setText("");
  };

  return (
    <Card className="border-gray-200 shadow-xs">
      <CardContent className="p-6 space-y-4">
        {/* Error Alert with Safe Retry */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={retryLastAnswer}
              disabled={isSubmitting}
              className="bg-white border-red-300 text-red-800 hover:bg-red-100 gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
              Retry Submission
            </Button>
          </div>
        )}

        {/* Yes / No Quick Response Option */}
        {isYesNoQuestion && (
          <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                Direct Screening Question
              </span>
              <span className="text-xs text-brand-700">Quick Answer or Type Below</span>
            </div>
            <p className="text-xs text-brand-800">
              Select Yes or No to proceed. The interviewer will adapt the follow-up question based on your experience.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Button
                type="button"
                size="md"
                disabled={isSubmitting}
                onClick={() => handleQuickYesNo("Yes")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6 shadow-xs"
              >
                <Check className="w-4 h-4" />
                Yes
              </Button>
              <Button
                type="button"
                size="md"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleQuickYesNo("No")}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 gap-2 px-6"
              >
                <X className="w-4 h-4" />
                No
              </Button>
            </div>
          </div>
        )}

        {/* Candidate Text Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900 block">
              {isYesNoQuestion ? "Or elaborate your response:" : "Your Response:"}
            </label>
            <span className="text-xs text-gray-400 font-mono">
              {text.length} characters
            </span>
          </div>

          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            placeholder={
              isYesNoQuestion
                ? "You can also explain your experience directly (e.g., 'Yes, I used Git flow with daily feature branches...')"
                : "Type your response clearly. Focus on specific technical decisions, challenges, trade-offs, and outcomes..."
            }
            className="w-full p-4 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y placeholder:text-gray-400 font-sans leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Tip: Clearly state your role, the trade-offs considered, and measurable impact.
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentQuestionIndex >= 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={finishEarlyAndEvaluate}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto text-xs text-gray-600 gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-brand-600" />
                  Finish & Evaluate ({currentQuestionIndex} Qs)
                </Button>
              )}

              <Button
                type="submit"
                size="md"
                disabled={!text.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="w-full sm:w-auto px-6 gap-2"
              >
                <span>{isSubmitting ? "Evaluating..." : "Submit Answer"}</span>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
