"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  InterviewConfig,
  InterviewQuestion,
  InterviewAnswer,
  InterviewSession,
} from "@/types/interview";
import { adaptiveEngine, getStreamQuestionCount } from "@/services/adaptiveEngine.service";
import { evaluationService } from "@/services/evaluation.service";
import { interviewService } from "@/services/interview.service";
import { useAuth } from "@/context/AuthContext";

interface InterviewContextType {
  config: InterviewConfig;
  currentQuestion: InterviewQuestion | null;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  totalQuestions: number;
  timeElapsedSeconds: number;
  isSubmitting: boolean;
  submitAnswer: (answerText: string) => Promise<void>;
  endInterview: () => void;
}

const defaultConfig: InterviewConfig = {
  targetRole: "Software Engineer",
  companyType: "Product Company",
  experienceLevel: "2–5 years",
  interviewType: "Behavioral",
  mode: "Text",
  difficulty: "Realistic",
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  const [config, setConfig] = useState<InterviewConfig>(defaultConfig);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeElapsedSeconds, setTimeElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize config and first question from session storage or defaults
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedConfigStr = sessionStorage.getItem("preppilot_active_config");
      let activeConfig = defaultConfig;
      if (storedConfigStr) {
        try {
          activeConfig = JSON.parse(storedConfigStr);
        } catch {
          // fallback to default
        }
      }
      setConfig(activeConfig);

      const initialQ = adaptiveEngine.generateInitialQuestion(activeConfig);
      setQuestions([initialQ]);
    }
  }, []);

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalQuestions = getStreamQuestionCount(config);

  const submitAnswer = async (answerText: string) => {
    setIsSubmitting(true);

    const currentQ = questions[currentQuestionIndex];
    const newAnswer: InterviewAnswer = {
      id: `a-${Date.now()}`,
      questionId: currentQ.id,
      text: answerText,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: 60,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    const nextQNum = currentQuestionIndex + 2; // 1-indexed next question

    if (nextQNum > totalQuestions) {
      // Complete interview: generate STAR structured evaluation
      const evaluation = evaluationService.evaluateSession(config, questions, updatedAnswers);

      const completedSession: InterviewSession = {
        id: `session-${Date.now()}`,
        userId: user?.uid || "guest",
        createdAt: new Date().toISOString(),
        status: "completed",
        score: evaluation.overallScore,
        config,
        questions,
        answers: updatedAnswers,
        currentQuestionIndex,
        timeElapsedSeconds,
        evaluation,
      };

      // Persist to Firestore + local storage
      await interviewService.saveCompletedSession(completedSession, evaluation, user?.uid);

      setIsSubmitting(false);
      router.push(`/results?sessionId=${completedSession.id}`);
    } else {
      // Generate adaptive follow-up
      const followUpQ = adaptiveEngine.generateFollowUpQuestion(
        config,
        nextQNum,
        currentQ.text,
        answerText
      );

      setQuestions((prev) => [...prev, followUpQ]);
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsSubmitting(false);
    }
  };

  const endInterview = () => {
    router.push("/dashboard");
  };

  const currentQuestion = questions[currentQuestionIndex] || null;

  return (
    <InterviewContext.Provider
      value={{
        config,
        currentQuestion,
        questions,
        answers,
        currentQuestionIndex,
        totalQuestions,
        timeElapsedSeconds,
        isSubmitting,
        submitAnswer,
        endInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
}
