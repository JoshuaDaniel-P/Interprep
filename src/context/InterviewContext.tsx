"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  InterviewConfig,
  InterviewQuestion,
  InterviewAnswer,
  InterviewSession,
  RecordedQuestion,
  QuestionType,
} from "@/types/interview";
import { useAuth } from "@/context/AuthContext";
import { interviewService } from "@/services/interview.service";
import { candidateService } from "@/services/candidate.service";
import { adaptiveEngine, getStreamQuestionCount } from "@/services/adaptiveEngine.service";
import { evaluationService } from "@/services/evaluation.service";

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
  errorMessage: string | null;
  submitAnswer: (answerText: string) => Promise<void>;
  retryLastAnswer: () => Promise<void>;
  finishEarlyAndEvaluate: () => Promise<void>;
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
  targetQuestionsCount: 5,
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, user } = useAuth();

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

  const totalQuestions = getStreamQuestionCount(config);

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

      // Initial question tailored to candidate profile and target job
      const initialQ = adaptiveEngine.generateInitialQuestion(activeConfig, profile);
      setQuestions([initialQ]);
    }
  }, [profile]);

  // 2. Timer Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsedSeconds((prev) => prev + 1);
      setQuestionDurationSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Submit answer and transition to next adaptive question or complete session
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

    const questionNum = currentQuestionIndex + 1;
    const isFinalQuestion = questionNum >= totalQuestions;

    let updatedRecordedQuestions = [...recordedQuestions];
    let nextQ: InterviewQuestion | null = null;

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
          questionNumber: questionNum,
          targetTotal: totalQuestions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.recordedQuestion) {
            updatedRecordedQuestions.push(data.recordedQuestion);
            setRecordedQuestions(updatedRecordedQuestions);
          }

          if (isFinalQuestion || data.isComplete) {
            await completeAndSaveSession(updatedAnswers, questions, updatedRecordedQuestions);
            return;
          }

          if (data.nextQuestion) {
            nextQ = {
              id: `q-${questionNum + 1}`,
              questionNumber: questionNum + 1,
              totalQuestions,
              text: data.nextQuestion.text,
              category: data.nextQuestion.category,
              questionType: data.nextQuestion.questionType,
              difficulty: data.nextQuestion.difficulty,
              isFollowUp: data.nextQuestion.isFollowUp,
              followUpQuestionRelationship: data.nextQuestion.followUpQuestionRelationship,
              yesNoOptions: data.nextQuestion.yesNoOptions,
            };
          }
        }
      }
    } catch (e) {
      console.warn("API route evaluate-and-next error, using local evaluation and adaptive engine:", e);
    }

    // Fallback if API route had an issue or was offline: evaluate locally
    if (updatedRecordedQuestions.length <= currentQuestionIndex) {
      const localEval = evaluationService.evaluateSingleAnswer(currentQ, answerText, config);
      const fallbackRec: RecordedQuestion = {
        id: currentQ.id || `rec-${questionNum}`,
        questionNumber: questionNum,
        totalQuestions,
        question: currentQ.text,
        questionType: currentQ.questionType || "technical",
        difficulty: currentQ.difficulty || config.difficulty,
        candidateAnswer: answerText,
        timestamp: new Date().toISOString(),
        answerDuration: durationForAnswer,
        evaluation: localEval,
        isFollowUp: !!currentQ.isFollowUp,
        followUpQuestionRelationship: currentQ.followUpQuestionRelationship,
      };
      updatedRecordedQuestions.push(fallbackRec);
      setRecordedQuestions(updatedRecordedQuestions);
    }

    if (isFinalQuestion) {
      await completeAndSaveSession(updatedAnswers, questions, updatedRecordedQuestions);
      return;
    }

    if (!nextQ) {
      nextQ = adaptiveEngine.generateFollowUpQuestion(
        config,
        questionNum + 1,
        currentQ.text,
        answerText,
        profile
      );
    }

    setQuestions((prev) => [...prev, nextQ!]);
    setCurrentQuestionIndex((prev) => prev + 1);
    setQuestionDurationSeconds(0);
    setIsSubmitting(false);
  };

  const completeAndSaveSession = async (
    finalAnswers: InterviewAnswer[],
    finalQuestions: InterviewQuestion[],
    finalRecordedQuestions?: RecordedQuestion[]
  ) => {
    try {
      const recs = finalRecordedQuestions || recordedQuestions;
      const evaluation = evaluationService.evaluateSession(
        config,
        finalQuestions,
        finalAnswers,
        recs
      );

      const completedSession: InterviewSession = {
        id: `session-${Date.now()}`,
        userId: user?.uid || profile?.uid || "guest",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: "completed",
        score: evaluation.overallScore,
        config,
        questions: finalQuestions,
        answers: finalAnswers,
        recordedQuestions: recs,
        currentQuestionIndex,
        timeElapsedSeconds,
        evaluation,
        strengths: evaluation.strengths,
        weaknesses: evaluation.improvements,
        improvements: evaluation.recommendations,
      };

      await interviewService.saveCompletedSession(
        completedSession,
        evaluation,
        user?.uid || profile?.uid
      );

      // Explicitly store in sessionStorage and localStorage for immediate retrieval
      if (typeof window !== "undefined") {
        sessionStorage.setItem("preppilot_active_evaluation", JSON.stringify(evaluation));
        sessionStorage.setItem(`preppilot_eval_${completedSession.id}`, JSON.stringify(evaluation));
        sessionStorage.setItem("preppilot_completed_session", JSON.stringify(completedSession));
        try {
          localStorage.setItem(`preppilot_eval_${completedSession.id}`, JSON.stringify(evaluation));
          localStorage.setItem("preppilot_last_completed_session", JSON.stringify(completedSession));
        } catch {}
      }

      setIsSubmitting(false);
      router.push(`/results?sessionId=${completedSession.id}`);
    } catch (e) {
      console.warn("Error completing interview session:", e);
      setIsSubmitting(false);
      router.push("/results");
    }
  };

  const retryLastAnswer = async () => {
    if (lastFailedAnswerRef.current) {
      await submitAnswer(lastFailedAnswerRef.current);
    }
  };

  const finishEarlyAndEvaluate = async () => {
    setIsSubmitting(true);
    await completeAndSaveSession(answers, questions, recordedQuestions);
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
        totalQuestions,
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
