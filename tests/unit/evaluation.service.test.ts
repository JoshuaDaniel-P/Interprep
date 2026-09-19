import { describe, it, expect } from "vitest";
import { EvaluationService } from "@/services/evaluation.service";
import { InterviewConfig, InterviewQuestion, InterviewAnswer, RecordedQuestion } from "@/types/interview";

describe("EvaluationService", () => {
  const service = new EvaluationService();

  const mockConfig: InterviewConfig = {
    targetRole: "Software Engineer",
    companyType: "Product Company",
    experienceLevel: "2–5 years",
    interviewType: "Technical",
    mode: "Text",
    difficulty: "Realistic",
  };

  const mockQuestions: InterviewQuestion[] = [
    {
      id: "q-1",
      questionNumber: 1,
      totalQuestions: 1,
      text: "Explain how you resolved a high-latency database bottleneck in production using the STAR framework.",
      category: "System Design",
    },
  ];

  it("evaluates a high-quality STAR answer with high marks and relevant strengths", () => {
    const mockAnswers: InterviewAnswer[] = [
      {
        id: "a-1",
        questionId: "q-1",
        text: "In my previous project (Situation), our checkout API was experiencing 800ms latency spikes during peak traffic (Task). I analyzed the Postgres EXPLAIN ANALYZE logs and identified unindexed foreign key scans (Action). I implemented a composite index on user_id and created_at, and introduced Redis write-through caching for hot product catalogs. As a Result, we reduced query latency from 800ms to 24ms, cutting CPU utilization by 45% (Result).",
        submittedAt: new Date().toISOString(),
        timeSpentSeconds: 45,
      },
    ];

    const evaluation = service.evaluateSession(mockConfig, mockQuestions, mockAnswers);

    expect(evaluation).toBeDefined();
    expect(evaluation.overallScore).toBeGreaterThanOrEqual(7.0);
    expect(evaluation.categoryScores?.technicalKnowledge).toBeGreaterThanOrEqual(70);
    expect(evaluation.categoryScores?.problemSolving).toBeGreaterThanOrEqual(70);
    expect(evaluation.strengths.length).toBeGreaterThan(0);
  });

  it("severely penalizes dismissive or evasive answers and flags them for coaching", () => {
    const mockAnswers: InterviewAnswer[] = [
      {
        id: "a-1",
        questionId: "q-1",
        text: "I don't know, no idea really. Pass this question.",
        submittedAt: new Date().toISOString(),
        timeSpentSeconds: 10,
      },
    ];

    const evaluation = service.evaluateSession(mockConfig, mockQuestions, mockAnswers);

    expect(evaluation).toBeDefined();
    expect(evaluation.overallScore).toBeLessThanOrEqual(5.0);
    expect(evaluation.improvements.length).toBeGreaterThan(0);
    expect(
      evaluation.improvements.some(
        (w) => w.toLowerCase().includes("depth") || w.toLowerCase().includes("detail") || w.toLowerCase().includes("answer") || w.toLowerCase().includes("star") || w.toLowerCase().includes("concise") || w.toLowerCase().includes("structure")
      )
    ).toBe(true);
  });

  it("handles recorded question evaluations when provided by the adaptive pipeline", () => {
    const mockRecorded: RecordedQuestion[] = [
      {
        question: "How do you handle microservices distributed transactions?",
        candidateAnswer: "We use the Saga pattern with choreography and idempotent event consumers in RabbitMQ.",
        evaluation: {
          score: 8.5,
          feedback: "Strong grasp of Saga pattern and event-driven architectures.",
          strengths: ["Saga pattern", "Idempotency"],
          weaknesses: ["Could mention compensating transactions in detail"],
        } as any,
      } as any,
    ];

    const mockAnswers: InterviewAnswer[] = [
      {
        id: "a-1",
        questionId: "q-1",
        text: "We use the Saga pattern with choreography and idempotent event consumers in RabbitMQ.",
        submittedAt: new Date().toISOString(),
        timeSpentSeconds: 30,
      },
    ];

    const evaluation = service.evaluateSession(mockConfig, mockQuestions, mockAnswers, mockRecorded);

    expect(evaluation.overallScore).toBeCloseTo(8.5, 0.5);
  });
});
