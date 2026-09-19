import {
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
import { Evaluation } from "@/types/evaluation";
import { mockRecentInterviews, mockEvaluationDetails } from "@/data/mock/interview.mock";

export interface IInterviewService {
  getRecentInterviews(userId?: string): Promise<InterviewSession[]>;
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
      }
    }

    // 2. Check Firestore
    try {
      const snap = await getDoc(doc(db, "interviews", id));
      if (snap.exists()) {
        return snap.data() as StoredInterviewRecord;
      }
    } catch (e) {
      console.warn("Firestore fetch error:", e);
    }

    // 3. Fallback to mock session
    const mock = mockRecentInterviews.find((s) => s.id === id);
    return mock || null;
  }

  async getEvaluation(sessionId: string): Promise<Evaluation | null> {
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
  }

  async createSession(config: InterviewConfig): Promise<InterviewSession> {
    const newSession: InterviewSession = {
      id: `session-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "in_progress",
      config,
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
      answers: [],
      recordedQuestions: [],
      currentQuestionIndex: 0,
      timeElapsedSeconds: 0,
    };

    return Promise.resolve(newSession);
  }
}

export const interviewService = new InterviewService();
