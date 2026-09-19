import { InterviewSession, InterviewConfig } from "@/types/interview";
import { Evaluation } from "@/types/evaluation";
import { mockRecentInterviews, mockEvaluationDetails } from "@/data/mock/interview.mock";

export interface IInterviewService {
  getRecentInterviews(): Promise<InterviewSession[]>;
  getInterviewById(id: string): Promise<InterviewSession | null>;
  getEvaluation(sessionId: string): Promise<Evaluation | null>;
  createSession(config: InterviewConfig): Promise<InterviewSession>;
}

export class MockInterviewService implements IInterviewService {
  async getRecentInterviews(): Promise<InterviewSession[]> {
    return Promise.resolve(mockRecentInterviews);
  }

  async getInterviewById(id: string): Promise<InterviewSession | null> {
    const session = mockRecentInterviews.find((s) => s.id === id);
    return Promise.resolve(session || null);
  }

  async getEvaluation(sessionId: string): Promise<Evaluation | null> {
    const evaluation = mockEvaluationDetails[sessionId];
    return Promise.resolve(evaluation || null);
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
          totalQuestions: 5,
          text: `Tell me about a project you worked on recently as a ${config.targetRole}. What was your specific role and key impact?`,
          category: "Initial Overview",
        },
      ],
      answers: [],
      currentQuestionIndex: 0,
      timeElapsedSeconds: 0,
    };

    return Promise.resolve(newSession);
  }
}

export const interviewService = new MockInterviewService();
