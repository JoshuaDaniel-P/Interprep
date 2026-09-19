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
      <div className="p-8 text-center text-gray-500">
        Initializing AI Interviewer...
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
      <QuestionDisplay question={currentQuestion} />

      {/* Candidate Answer Box */}
      <AnswerInput onSubmit={submitAnswer} isSubmitting={isSubmitting} />
    </div>
  );
}
