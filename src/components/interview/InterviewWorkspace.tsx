"use client";

import React from "react";
import { useInterview } from "@/context/InterviewContext";
import { InterviewHeader } from "./InterviewHeader";
import { QuestionDisplay } from "./QuestionDisplay";
import { AnswerInput } from "./AnswerInput";

export function InterviewWorkspace() {
  const {
    config,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    timeElapsedSeconds,
    isSubmitting,
    submitAnswer,
    endInterview,
  } = useInterview();

  if (!currentQuestion) {
    return (
      <div className="glass-primary p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto shadow-md" />
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
          Initializing AI Interviewer...
        </h3>
        <p className="text-xs text-slate-600 font-semibold max-w-xs mx-auto">
          Calibrating adaptive technical & behavioral questions for {config?.targetRole || "your target role"}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Progress */}
      <InterviewHeader
        currentQuestionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        timeElapsedSeconds={timeElapsedSeconds}
        role={config.targetRole}
        difficulty={config.difficulty}
        company={config.company}
        onEndInterview={endInterview}
      />

      {/* Main Single Question Display */}
      <QuestionDisplay question={currentQuestion} autoSpeak={config.mode === "Voice"} />

      {/* Candidate Answer Box */}
      <AnswerInput onSubmit={submitAnswer} isSubmitting={isSubmitting} />
    </div>
  );
}
