import { InterviewConfig, InterviewQuestion } from "@/types/interview";

export function getStreamQuestionCount(config: InterviewConfig): number {
  if (config.questionCount && config.questionCount > 0) {
    return config.questionCount;
  }

  // Stream-specific dynamic question length
  if (config.interviewType === "HR" || config.targetRole === "Marketing" || config.targetRole === "Sales") {
    return 4;
  }
  if (config.interviewType === "Mixed" || config.targetRole === "Software Engineer") {
    return 6;
  }
  return 5; // Standard technical streams (Frontend, Backend, Data Analyst, Product Manager)
}

export interface IAdaptiveEngine {
  generateInitialQuestion(config: InterviewConfig): InterviewQuestion;
  generateFollowUpQuestion(
    config: InterviewConfig,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string
  ): InterviewQuestion;
}

export class AdaptiveEngineService implements IAdaptiveEngine {
  generateInitialQuestion(config: InterviewConfig): InterviewQuestion {
    const totalQuestions = getStreamQuestionCount(config);

    const roleQuestions: Record<string, string> = {
      "Software Engineer":
        "Tell me about a complex software project you designed or developed. What architectural decisions did you make, and how did you verify system reliability?",
      "Frontend Developer":
        "Can you walk me through a rich client-side application you built with React/Next.js? How did you manage state, component architecture, and rendering performance?",
      "Backend Developer":
        "Describe a REST or GraphQL API backend you designed. How did you structure your database queries, handle concurrency, and protect against service downtime?",
      "Data Analyst":
        "Tell me about a data analysis initiative where you cleaned noisy datasets, derived actionable business metrics, and presented insights to stakeholders.",
      "Product Manager":
        "Walk me through a product feature or MVP you led from user problem identification to launch. How did you define success metrics and prioritize requirements?",
      Marketing:
        "Describe a marketing or growth campaign you ran. What channels did you leverage, and how did you measure ROI and conversion rates?",
      Sales:
        "Describe a high-stakes customer pitch or client deal you navigated. How did you identify customer pain points and handle strong objections?",
    };

    const text =
      roleQuestions[config.targetRole] ||
      `Tell me about a core project you spearheaded as a ${config.targetRole} and what your specific technical contributions were.`;

    return {
      id: `q-1`,
      questionNumber: 1,
      totalQuestions,
      text,
      category: "Initial Overview",
      isFollowUp: false,
    };
  }

  generateFollowUpQuestion(
    config: InterviewConfig,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string
  ): InterviewQuestion {
    const totalQuestions = getStreamQuestionCount(config);
    const lowerAnswer = candidateAnswer.toLowerCase();

    let text = "";
    let isFollowUp = true;
    let category = "Adaptive Follow-up";

    // Adaptive contextual probing based on what candidate answered
    if (lowerAnswer.includes("redis") || lowerAnswer.includes("cache") || lowerAnswer.includes("caching")) {
      text =
        "How did you determine that caching was the appropriate bottleneck remedy over database indexing, and how did you handle cache invalidation and stale data?";
    } else if (
      lowerAnswer.includes("performance") ||
      lowerAnswer.includes("slow") ||
      lowerAnswer.includes("latency") ||
      lowerAnswer.includes("bottleneck")
    ) {
      text =
        "What specific quantitative metrics (e.g. p95/p99 latency, render times) did you measure before and after, and how did you isolate the root cause?";
    } else if (
      lowerAnswer.includes("team") ||
      lowerAnswer.includes("senior") ||
      lowerAnswer.includes("disagree") ||
      lowerAnswer.includes("conflict")
    ) {
      text =
        "When technical disagreements arose regarding architecture or requirements, what concrete process did you follow to align the team and reach a decision?";
    } else if (
      lowerAnswer.includes("database") ||
      lowerAnswer.includes("sql") ||
      lowerAnswer.includes("postgres") ||
      lowerAnswer.includes("mongodb") ||
      lowerAnswer.includes("query")
    ) {
      text =
        "How did you structure your schema and indexing strategy, and how did you test query execution plans under concurrent load?";
    } else if (
      lowerAnswer.includes("react") ||
      lowerAnswer.includes("next") ||
      lowerAnswer.includes("ui") ||
      lowerAnswer.includes("frontend")
    ) {
      text =
        "How did you prevent unnecessary re-renders and optimize Core Web Vitals (LCP, CLS, INP) in that user interface?";
    } else if (
      lowerAnswer.includes("metric") ||
      lowerAnswer.includes("kpi") ||
      lowerAnswer.includes("user") ||
      lowerAnswer.includes("conversion")
    ) {
      text =
        "What unexpected user behaviors did you discover post-launch, and how did those findings influence your subsequent iterations?";
    } else {
      // General stream-based follow-ups matching question depth
      const streamFollowUps: Record<string, string[]> = {
        "Frontend Developer": [
          "What component abstractions or custom hooks did you write to keep the codebase maintainable for other engineers?",
          "How did you ensure responsive accessibility (WCAG) and seamless cross-browser behavior across device viewports?",
          "If you had to refactor that front-end codebase now, what modern web architectural patterns would you implement?",
        ],
        "Backend Developer": [
          "How did you handle authentication, authorization, and rate-limiting on those server endpoints?",
          "What failure scenarios (e.g., downstream timeouts, network partitions) did you design for and test?",
          "How did you structure your logging, telemetry, and automated unit/integration test suite?",
        ],
        "Software Engineer": [
          "What were the most critical technical trade-offs you balanced between delivery speed and engineering quality?",
          "How did you manage technical debt during rapid iteration cycles?",
          "If traffic increased 10x overnight, where would that system fail first and how would you scale it?",
        ],
      };

      const pool =
        streamFollowUps[config.targetRole] || [
          "What was the most challenging technical obstacle you faced during that phase, and how did you resolve it?",
          "If you were to rebuild that project today with your current knowledge, what design choices would you change?",
          "How did you communicate technical complexity and milestones to cross-functional stakeholders?",
          "What measurable impact did your solution have on the overall product or business objectives?",
        ];

      text = pool[(questionNumber - 2) % pool.length];
      if (questionNumber === totalQuestions) {
        category = "Closing & Impact";
      } else if (questionNumber % 2 === 1) {
        isFollowUp = false;
        category = "Core Competency";
      }
    }

    return {
      id: `q-${questionNumber}`,
      questionNumber,
      totalQuestions,
      text,
      category,
      isFollowUp,
    };
  }
}

export const adaptiveEngine = new AdaptiveEngineService();
