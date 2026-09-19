import { InterviewSession } from "@/types/interview";
import { Evaluation } from "@/types/evaluation";

export const mockRecentInterviews: InterviewSession[] = [
  {
    id: "session-101",
    createdAt: "2026-09-19T10:00:00Z",
    status: "completed",
    score: 7.4,
    config: {
      targetRole: "Software Engineer",
      companyType: "Product Company",
      experienceLevel: "2–5 years",
      interviewType: "Behavioral",
      mode: "Text",
      difficulty: "Realistic",
    },
    questions: [
      {
        id: "q-1",
        questionNumber: 1,
        totalQuestions: 5,
        text: "Tell me about a complex project you led and the key technical decisions you made.",
        category: "Leadership & Architecture",
      },
      {
        id: "q-2",
        questionNumber: 2,
        totalQuestions: 5,
        text: "How did you determine that Redis caching was the right solution for your performance bottleneck?",
        category: "System Design",
        isFollowUp: true,
      },
      {
        id: "q-3",
        questionNumber: 3,
        totalQuestions: 5,
        text: "Tell me about a time you had a disagreement with a senior engineer regarding system architecture.",
        category: "Conflict Resolution",
      },
    ],
    answers: [
      {
        id: "a-1",
        questionId: "q-1",
        text: "I built a payment API using Node.js. We had performance issues under high load, so I introduced Redis caching to reduce database reads.",
        submittedAt: "2026-09-19T10:03:00Z",
        timeSpentSeconds: 110,
      },
      {
        id: "a-2",
        questionId: "q-2",
        text: "We benchmarked our DB query latency which took 450ms on average. Redis brought latency down to 25ms for 85% of read traffic.",
        submittedAt: "2026-09-19T10:06:00Z",
        timeSpentSeconds: 95,
      },
    ],
    currentQuestionIndex: 3,
    timeElapsedSeconds: 620,
  },
  {
    id: "session-100",
    createdAt: "2026-09-17T14:30:00Z",
    status: "completed",
    score: 6.8,
    config: {
      targetRole: "Software Engineer",
      companyType: "Startup",
      experienceLevel: "2–5 years",
      interviewType: "Technical",
      mode: "Text",
      difficulty: "Realistic",
    },
    questions: [],
    answers: [],
    currentQuestionIndex: 5,
    timeElapsedSeconds: 900,
  },
  {
    id: "session-099",
    createdAt: "2026-09-14T09:15:00Z",
    status: "completed",
    score: 6.1,
    config: {
      targetRole: "Software Engineer",
      companyType: "Enterprise",
      experienceLevel: "2–5 years",
      interviewType: "Mixed",
      mode: "Text",
      difficulty: "Comfortable",
    },
    questions: [],
    answers: [],
    currentQuestionIndex: 5,
    timeElapsedSeconds: 1100,
  },
];

export const mockEvaluationDetails: Record<string, Evaluation> = {
  "session-101": {
    sessionId: "session-101",
    overallScore: 7.4,
    evaluatedAt: "2026-09-19T10:12:00Z",
    skills: {
      content: { score: 8.0, feedback: "Excellent use of quantitative metrics ( latency reduction from 450ms to 25ms)." },
      structure: { score: 6.8, feedback: "Good problem-solution framing, but could emphasize team collaboration more." },
      relevance: { score: 8.5, feedback: "Answers directly answered the interviewer's specific follow-up questions." },
      clarity: { score: 7.4, feedback: "Clear description of system trade-offs." },
      confidence: { score: 7.2, feedback: "Decisive reasoning behind tech stack selection." },
      conciseness: { score: 6.4, feedback: "Initial answer was slightly brief before the follow-up question." },
    },
    strengths: [
      "Quantified impact effectively with concrete performance metrics.",
      "Clear explanation of why Redis was chosen over alternative caching systems.",
      "Maintained professional tone and structured responses.",
    ],
    improvements: [
      "Include trade-offs and invalidation strategies when discussing cache implementations.",
      "Use STAR format explicitly to structure behavioral answers.",
    ],
    recommendations: [
      "In your next technical interview, proactively mention cache invalidation strategies (e.g. TTL vs write-through) before being prompted.",
      "Keep answers under 90 seconds while maintaining the STAR structure.",
    ],
  },
};
