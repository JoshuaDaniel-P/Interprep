import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InterviewSession, InterviewConfig } from "@/types/interview";
import { Evaluation } from "@/types/evaluation";
import { evaluationService } from "./evaluation.service";
import { mockRecentInterviews, mockEvaluationDetails } from "@/data/mock/interview.mock";

export interface IInterviewService {
  getRecentInterviews(userId?: string): Promise<InterviewSession[]>;
  getInterviewById(id: string, userId?: string): Promise<InterviewSession | null>;
  getEvaluation(sessionId: string): Promise<Evaluation | null>;
  saveCompletedSession(
    session: InterviewSession,
    evaluation: Evaluation,
    userId?: string
  ): Promise<void>;
  createSession(config: InterviewConfig, userId?: string): Promise<InterviewSession>;
}

export class InterviewService implements IInterviewService {
  async getRecentInterviews(userId?: string): Promise<InterviewSession[]> {
    // 1. Try local cache first for instant responsiveness
    let localSessions: InterviewSession[] = [];
    if (typeof window !== "undefined") {
      try {
        const cacheKey = userId ? `preppilot_sessions_${userId}` : "preppilot_sessions_all";
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          localSessions = JSON.parse(cached);
        }
      } catch (e) {
        console.warn("Error reading local sessions cache:", e);
      }
    }

    // 2. Fetch from Firestore
    try {
      if (userId) {
        const sessionsRef = collection(db, "users", userId, "sessions");
        const snap = await getDocs(sessionsRef);
        if (!snap.empty) {
          const remoteSessions = snap.docs.map((d) => d.data() as InterviewSession);
          remoteSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          if (typeof window !== "undefined") {
            localStorage.setItem(`preppilot_sessions_${userId}`, JSON.stringify(remoteSessions));
          }
          return remoteSessions;
        }
      }
    } catch (e) {
      console.warn("Firestore fetch recent interviews error (using local):", e);
    }

    if (localSessions.length > 0) {
      return localSessions;
    }

    // Fallback to sample mock sessions if brand new
    return mockRecentInterviews;
  }

  async getInterviewById(id: string, userId?: string): Promise<InterviewSession | null> {
    // 1. Check local session storage or local storage
    if (typeof window !== "undefined") {
      try {
        const activeStr = sessionStorage.getItem("preppilot_completed_session");
        if (activeStr) {
          const active = JSON.parse(activeStr) as InterviewSession;
          if (active.id === id) return active;
        }

        const cacheKey = userId ? `preppilot_sessions_${userId}` : "preppilot_sessions_all";
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const list: InterviewSession[] = JSON.parse(cached);
          const found = list.find((s) => s.id === id);
          if (found) return found;
        }
      } catch (e) {
        console.warn("Local storage lookup error:", e);
      }
    }

    // 2. Check Firestore
    try {
      if (userId) {
        const ref = doc(db, "users", userId, "sessions", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          return snap.data() as InterviewSession;
        }
      }

      // Also check global sessions collection
      const globalRef = doc(db, "interview_sessions", id);
      const globalSnap = await getDoc(globalRef);
      if (globalSnap.exists()) {
        return globalSnap.data() as InterviewSession;
      }
    } catch (e) {
      console.warn("Firestore getInterviewById error:", e);
    }

    const mock = mockRecentInterviews.find((s) => s.id === id);
    return mock || null;
  }

  async getEvaluation(sessionId: string): Promise<Evaluation | null> {
    // 1. Check session storage active evaluation
    if (typeof window !== "undefined") {
      try {
        const activeEvalStr = sessionStorage.getItem(`preppilot_eval_${sessionId}`);
        if (activeEvalStr) {
          return JSON.parse(activeEvalStr);
        }

        const activeSessionStr = sessionStorage.getItem("preppilot_completed_session");
        if (activeSessionStr) {
          const activeSession = JSON.parse(activeSessionStr) as InterviewSession;
          if (activeSession.id === sessionId && activeSession.evaluation) {
            return activeSession.evaluation;
          }
        }
      } catch (e) {
        console.warn("Session storage lookup for evaluation error:", e);
      }
    }

    // 2. Check Firestore
    try {
      const evalRef = doc(db, "evaluations", sessionId);
      const evalSnap = await getDoc(evalRef);
      if (evalSnap.exists()) {
        return evalSnap.data() as Evaluation;
      }
    } catch (e) {
      console.warn("Firestore getEvaluation error:", e);
    }

    // 3. Mock fallback
    return mockEvaluationDetails[sessionId] || mockEvaluationDetails["session-101"] || null;
  }

  async saveCompletedSession(
    session: InterviewSession,
    evaluation: Evaluation,
    userId?: string
  ): Promise<void> {
    const sessionWithEval: InterviewSession = {
      ...session,
      userId: userId || "guest",
      score: evaluation.overallScore,
      evaluation,
    };

    // 1. Cache in browser
    if (typeof window !== "undefined") {
      sessionStorage.setItem("preppilot_completed_session", JSON.stringify(sessionWithEval));
      sessionStorage.setItem(`preppilot_eval_${session.id}`, JSON.stringify(evaluation));

      const cacheKey = userId ? `preppilot_sessions_${userId}` : "preppilot_sessions_all";
      try {
        const existingStr = localStorage.getItem(cacheKey);
        const existing: InterviewSession[] = existingStr ? JSON.parse(existingStr) : [];
        const updated = [sessionWithEval, ...existing.filter((s) => s.id !== session.id)];
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      } catch (e) {
        console.warn("Local storage save error:", e);
      }
    }

    // 2. Persist to Firestore
    try {
      if (userId) {
        const userSessionRef = doc(db, "users", userId, "sessions", session.id);
        await setDoc(userSessionRef, sessionWithEval, { merge: true });
      }

      // Also save to top-level collections for easy queries
      const globalSessionRef = doc(db, "interview_sessions", session.id);
      await setDoc(globalSessionRef, sessionWithEval, { merge: true });

      const evalRef = doc(db, "evaluations", session.id);
      await setDoc(evalRef, evaluation, { merge: true });
    } catch (e) {
      console.warn("Firestore interview session save error (stored locally):", e);
    }
  }

  async createSession(config: InterviewConfig, userId?: string): Promise<InterviewSession> {
    const newSession: InterviewSession = {
      id: `session-${Date.now()}`,
      userId: userId || "guest",
      createdAt: new Date().toISOString(),
      status: "in_progress",
      config,
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      timeElapsedSeconds: 0,
    };
    return newSession;
  }
}

export const interviewService = new InterviewService();
