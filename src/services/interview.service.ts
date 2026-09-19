import {
<<<<<<< HEAD
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
=======
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  InterviewSession,
  InterviewConfig,
  StoredInterviewRecord,
} from "@/types/interview";
>>>>>>> origin/main
import { Evaluation } from "@/types/evaluation";
import { evaluationService } from "./evaluation.service";
import { mockRecentInterviews, mockEvaluationDetails } from "@/data/mock/interview.mock";

export interface IInterviewService {
  getRecentInterviews(userId?: string): Promise<InterviewSession[]>;
<<<<<<< HEAD
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
=======
  getInterviewById(id: string): Promise<StoredInterviewRecord | InterviewSession | null>;
  getEvaluation(sessionId: string): Promise<Evaluation | null>;
  createSession(config: InterviewConfig): Promise<InterviewSession>;
  saveInterviewRecord(record: StoredInterviewRecord): Promise<void>;
}

export class InterviewService implements IInterviewService {
  private localKey = "preppilot_all_interview_records";

  async saveInterviewRecord(record: StoredInterviewRecord): Promise<void> {
    // 1. Save locally for instant availability
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.localKey);
        const list: StoredInterviewRecord[] = stored ? JSON.parse(stored) : [];
        const filtered = list.filter((r) => r.id !== record.id);
        filtered.unshift(record);
        localStorage.setItem(this.localKey, JSON.stringify(filtered));
        localStorage.setItem(`preppilot_record_${record.id}`, JSON.stringify(record));
      } catch (e) {
        console.warn("Local storage save error:", e);
      }
    }

    // 2. Persist to Firestore: interviews/{interviewId}
    try {
      const ref = doc(db, "interviews", record.id);
      await setDoc(ref, record, { merge: true });
    } catch (e) {
      console.warn("Firestore save error (stored locally):", e);
    }
  }

  async getRecentInterviews(userId?: string): Promise<InterviewSession[]> {
    const recordsMap = new Map<string, StoredInterviewRecord>();

    // 1. Read from local storage
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(this.localKey);
        if (raw) {
          const parsed: StoredInterviewRecord[] = JSON.parse(raw);
          parsed.forEach((r) => {
            if (!userId || r.userId === userId || r.userId === "candidate-user-active") {
              recordsMap.set(r.id, r);
            }
          });
        }
      } catch (e) {
        console.warn("Local storage parse error:", e);
      }
    }

    // 2. Read from Firestore if available
    if (userId) {
      try {
        const q = query(collection(db, "interviews"), where("userId", "==", userId));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const data = d.data() as StoredInterviewRecord;
          recordsMap.set(data.id, data);
        });
      } catch (e) {
        console.warn("Firestore query error, using cached records:", e);
      }
    }

    // Convert stored records to InterviewSession format
    const realSessions: InterviewSession[] = Array.from(recordsMap.values()).map((r) => ({
      id: r.id,
      createdAt: r.startedAt || r.completedAt,
      completedAt: r.completedAt,
      userId: r.userId,
      status: "completed",
      score: r.overallScore,
      categoryScores: r.categoryScores,
      timeElapsedSeconds: r.duration,
      currentQuestionIndex: r.questionCount - 1,
      config: {
        targetRole: r.role,
        companyType: r.companyType,
        company: r.company,
        difficulty: r.difficulty,
        experienceLevel: "2–5 years",
        interviewType: "Mixed",
        mode: "Text",
        targetQuestionsCount: r.questionCount,
      },
      questions: r.questions.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        totalQuestions: q.totalQuestions,
        text: q.question,
        questionType: q.questionType,
        difficulty: q.difficulty,
        isFollowUp: q.isFollowUp,
      })),
      answers: r.questions.map((q) => ({
        id: `ans-${q.id}`,
        questionId: q.id,
        text: q.candidateAnswer,
        submittedAt: q.timestamp,
        timeSpentSeconds: q.answerDuration,
      })),
      recordedQuestions: r.questions,
      strengths: r.strengths,
      weaknesses: r.weaknesses,
      improvements: r.improvements,
      recommendedPreparationAreas: r.recommendedPreparationAreas,
    }));

    if (realSessions.length > 0) {
      // Sort newest first
      return realSessions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Fallback to mock records if user has no completed interviews yet
    return mockRecentInterviews;
  }

  async getInterviewById(id: string): Promise<StoredInterviewRecord | InterviewSession | null> {
    // 1. Check local storage
    if (typeof window !== "undefined") {
      const single = localStorage.getItem(`preppilot_record_${id}`);
      if (single) {
        try {
          return JSON.parse(single);
        } catch {}
      }

      const raw = localStorage.getItem(this.localKey);
      if (raw) {
        try {
          const list: StoredInterviewRecord[] = JSON.parse(raw);
          const found = list.find((item) => item.id === id);
          if (found) return found;
        } catch {}
>>>>>>> origin/main
      }
    }

    // 2. Check Firestore
    try {
<<<<<<< HEAD
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

=======
      const snap = await getDoc(doc(db, "interviews", id));
      if (snap.exists()) {
        return snap.data() as StoredInterviewRecord;
      }
    } catch (e) {
      console.warn("Firestore fetch error:", e);
    }

    // 3. Fallback to mock session
>>>>>>> origin/main
    const mock = mockRecentInterviews.find((s) => s.id === id);
    return mock || null;
  }

  async getEvaluation(sessionId: string): Promise<Evaluation | null> {
<<<<<<< HEAD
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
=======
    // Check if session storage has active evaluation from completed interview
    if (typeof window !== "undefined") {
      const activeEval = sessionStorage.getItem("preppilot_active_evaluation");
      if (activeEval) {
        try {
          const parsed: Evaluation = JSON.parse(activeEval);
          if (parsed.sessionId === sessionId || !sessionId) {
            return parsed;
          }
        } catch {}
      }
    }

    // Check stored interview record
    const record = await this.getInterviewById(sessionId);
    if (record && "categoryScores" in record && record.categoryScores) {
      const stored = record as StoredInterviewRecord;
      return {
        sessionId: stored.id,
        overallScore: stored.overallScore,
        skills: {
          content: {
            score: Number(((stored.categoryScores?.technicalKnowledge || 70) / 10).toFixed(1)),
            feedback: "Technical depth and breadth across system domains.",
          },
          structure: {
            score: Number(((stored.categoryScores?.problemSolving || 70) / 10).toFixed(1)),
            feedback: "Logical framework and STAR structure.",
          },
          relevance: {
            score: Number(((stored.categoryScores?.roleKnowledge || 70) / 10).toFixed(1)),
            feedback: "Alignment with interviewer constraints.",
          },
          clarity: {
            score: Number(((stored.categoryScores?.communication || 70) / 10).toFixed(1)),
            feedback: "Terminology precision and explanation flow.",
          },
          confidence: {
            score: Number(((stored.categoryScores?.behavioral || 70) / 10).toFixed(1)),
            feedback: "Technical assertion and ownership.",
          },
          conciseness: {
            score: Number(((stored.categoryScores?.projects || 70) / 10).toFixed(1)),
            feedback: "Focus on actions and measurable results.",
          },
        },
        categoryScores: stored.categoryScores,
        strengths: stored.strengths,
        improvements: stored.weaknesses,
        recommendations: stored.recommendedPreparationAreas,
        recurringIssues: stored.recurringIssues,
        missingKnowledge: stored.missingKnowledge,
        answerStructureIssues: stored.answerStructureIssues,
        communicationIssues: stored.communicationIssues,
        technicalGaps: stored.technicalGaps,
        recommendedPreparationAreas: stored.recommendedPreparationAreas,
        questions: stored.questions,
        evaluatedAt: stored.completedAt,
      };
    }

    return mockEvaluationDetails[sessionId] || null;
>>>>>>> origin/main
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
<<<<<<< HEAD
      questions: [],
=======
      questions: [
        {
          id: "q-1",
          questionNumber: 1,
          totalQuestions: config.targetQuestionsCount || 15,
          text: `Welcome! To start our interview for the ${config.targetRole} position at ${config.company || config.companyType}, could you give me a brief overview of your technical background and what you've been working on recently?`,
          category: "Initial Overview",
          questionType: "candidate_specific",
          difficulty: config.difficulty,
          isFollowUp: false,
        },
      ],
>>>>>>> origin/main
      answers: [],
      recordedQuestions: [],
      currentQuestionIndex: 0,
      timeElapsedSeconds: 0,
    };
    return newSession;
  }
}

export const interviewService = new InterviewService();
