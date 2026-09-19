"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  InterviewConfig,
  InterviewQuestion,
  InterviewAnswer,
<<<<<<< HEAD
  InterviewSession,
} from "@/types/interview";
import { adaptiveEngine, getStreamQuestionCount } from "@/services/adaptiveEngine.service";
import { evaluationService } from "@/services/evaluation.service";
import { interviewService } from "@/services/interview.service";
import { useAuth } from "@/context/AuthContext";
=======
  RecordedQuestion,
  QuestionType,
} from "@/types/interview";
import { useAuth } from "@/context/AuthContext";
import { interviewService } from "@/services/interview.service";
import { candidateService } from "@/services/candidate.service";
>>>>>>> origin/main

interface InterviewContextType {
  config: InterviewConfig;
  currentQuestion: InterviewQuestion | null;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  recordedQuestions: RecordedQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  timeElapsedSeconds: number;
  questionDurationSeconds: number;
  isSubmitting: boolean;
<<<<<<< HEAD
  submitAnswer: (answerText: string) => Promise<void>;
=======
  errorMessage: string | null;
  submitAnswer: (answerText: string) => Promise<void>;
  retryLastAnswer: () => Promise<void>;
  finishEarlyAndEvaluate: () => Promise<void>;
>>>>>>> origin/main
  endInterview: () => void;
}

const defaultConfig: InterviewConfig = {
  targetRole: "Software Engineer",
  companyType: "Product Company",
  company: "Tech Corp",
  experienceLevel: "2–5 years",
  interviewType: "Mixed",
  mode: "Text",
  difficulty: "Adaptive",
  targetQuestionsCount: 15,
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
<<<<<<< HEAD
  const { user } = useAuth();
=======
  const { profile, user } = useAuth();
>>>>>>> origin/main

  const [config, setConfig] = useState<InterviewConfig>(defaultConfig);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [recordedQuestions, setRecordedQuestions] = useState<RecordedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeElapsedSeconds, setTimeElapsedSeconds] = useState(0);
  const [questionDurationSeconds, setQuestionDurationSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lastFailedAnswerRef = useRef<string | null>(null);

  const targetQuestionsCount = config.targetQuestionsCount || 15;

  // 1. Initialize configuration and Question 1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedConfigStr = sessionStorage.getItem("preppilot_active_config");
      let activeConfig = defaultConfig;
      if (storedConfigStr) {
        try {
          activeConfig = { ...defaultConfig, ...JSON.parse(storedConfigStr) };
        } catch {
          // fallback
        }
      }
      setConfig(activeConfig);

      // Construct Candidate-specific initial question using actual profile
      const userProject = profile?.projects?.[0];
      let initialText = `Welcome! To begin our interview for the ${activeConfig.targetRole} role at ${activeConfig.company || activeConfig.companyType}, could you introduce yourself and walk me through a technical project you built recently?`;

      if (userProject?.name) {
        initialText = `Welcome! To start our interview for the ${activeConfig.targetRole} position at ${activeConfig.company || activeConfig.companyType}, could you give an overview of your work on "${userProject.name}" and your primary architectural contributions?`;
      }

      const initialQ: InterviewQuestion = {
        id: "q-1",
        questionNumber: 1,
        totalQuestions: activeConfig.targetQuestionsCount || 15,
        text: initialText,
        category: "Candidate Project & Background",
        questionType: "project",
        difficulty: activeConfig.difficulty,
        isFollowUp: false,
      };

      setQuestions([initialQ]);
    }
  }, [profile]);

  // Overall session timer & per-question timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsedSeconds((prev) => prev + 1);
      setQuestionDurationSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

<<<<<<< HEAD
  const totalQuestions = getStreamQuestionCount(config);

=======
  // Submit answer and query backend evaluate-and-next
>>>>>>> origin/main
  const submitAnswer = async (answerText: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    lastFailedAnswerRef.current = answerText;

    const currentQ = questions[currentQuestionIndex];
    const durationForAnswer = questionDurationSeconds;

    const newAnswer: InterviewAnswer = {
      id: `a-${Date.now()}`,
      questionId: currentQ.id,
      text: answerText,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: durationForAnswer,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

<<<<<<< HEAD
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
=======
    try {
      const response = await fetch("/api/interview/evaluate-and-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          candidateProfile: profile,
          previousQuestions: recordedQuestions,
          currentQuestion: currentQ,
          candidateAnswer: answerText,
          answerDuration: durationForAnswer,
          questionNumber: currentQuestionIndex + 1,
          targetTotal: targetQuestionsCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Evaluation failed");
      }

      const updatedRecorded = [...recordedQuestions, data.recordedQuestion];
      setRecordedQuestions(updatedRecorded);

      // Check if finished
      if (data.isComplete || currentQuestionIndex + 1 >= targetQuestionsCount) {
        await finalizeInterview(updatedRecorded, timeElapsedSeconds);
      } else if (data.nextQuestion) {
        setQuestions((prev) => [...prev, data.nextQuestion]);
        setCurrentQuestionIndex((prev) => prev + 1);
        setQuestionDurationSeconds(0);
        setIsSubmitting(false);
      } else {
        // Fallback wrap up if no next question
        await finalizeInterview(updatedRecorded, timeElapsedSeconds);
      }
    } catch (err) {
      console.error("Interview submission error:", err);
      setErrorMessage(
        "There was a temporary network issue submitting your answer. Your response is saved. Please click Retry."
      );
      setIsSubmitting(false);
    }
  };

  const retryLastAnswer = async () => {
    if (lastFailedAnswerRef.current) {
      await submitAnswer(lastFailedAnswerRef.current);
    }
  };

  // Finalize interview report and persist
  const finalizeInterview = async (recorded: RecordedQuestion[], totalTime: number) => {
    setIsSubmitting(true);
    try {
      const activeUid = user?.uid || profile?.uid || "candidate-user-active";

      const res = await fetch("/api/interview/final-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          candidateProfile: profile,
          recordedQuestions: recorded,
          durationSeconds: totalTime,
          userId: activeUid,
        }),
      });

      const data = await res.json();
      if (data.success && data.storedRecord) {
        // Save to Firestore and local storage
        await interviewService.saveInterviewRecord(data.storedRecord);

        // Update candidate readiness in profile
        if (data.storedRecord.categoryScores) {
          await candidateService.updateCandidateReadinessAfterInterview(
            activeUid,
            data.storedRecord.categoryScores
          );
        }

        if (typeof window !== "undefined") {
          sessionStorage.setItem("preppilot_active_evaluation", JSON.stringify(data.evaluation));
          sessionStorage.setItem("preppilot_completed_session", JSON.stringify(data.storedRecord));
        }

        router.push("/results");
      } else {
        throw new Error("Failed to generate final evaluation");
      }
    } catch (e) {
      console.error("Failed to finalize interview:", e);
      // Even if finalization endpoint fails, route to results with existing recorded questions
      router.push("/results");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishEarlyAndEvaluate = async () => {
    if (recordedQuestions.length === 0) {
      router.push("/dashboard");
      return;
    }
    await finalizeInterview(recordedQuestions, timeElapsedSeconds);
>>>>>>> origin/main
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
        recordedQuestions,
        currentQuestionIndex,
        totalQuestions: targetQuestionsCount,
        timeElapsedSeconds,
        questionDurationSeconds,
        isSubmitting,
        errorMessage,
        submitAnswer,
        retryLastAnswer,
        finishEarlyAndEvaluate,
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
