import { InterviewConfig, InterviewQuestion } from "@/types/interview";

export interface IAdaptiveEngine {
  generateInitialQuestion(config: InterviewConfig): InterviewQuestion;
  generateFollowUpQuestion(
    config: InterviewConfig,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string
  ): InterviewQuestion;
}

export class MockAdaptiveEngine implements IAdaptiveEngine {
  generateInitialQuestion(config: InterviewConfig): InterviewQuestion {
    const roleQuestions: Record<string, string> = {
      "Software Engineer":
        "Tell me about a technical project you worked on recently that had performance or scaling challenges.",
      "Frontend Developer":
        "Can you walk me through a complex React or web interface you built and how you handled client-side performance?",
      "Backend Developer":
        "Describe a data pipeline or backend API you built and how you ensured reliability under heavy load.",
      "Data Analyst":
        "Tell me about an analysis project where you had to work with noisy data to deliver actionable insights.",
      "Product Manager":
        "Describe a product feature you launched from inception to deployment. How did you measure success?",
      Marketing:
        "Tell me about a marketing campaign you ran and how you optimized conversion metrics.",
      Sales:
        "Describe a difficult client deal you closed and how you handled key objections.",
    };

    const text =
      roleQuestions[config.targetRole] ||
      `Tell me about a project you led as a ${config.targetRole} and what your specific contributions were.`;

    return {
      id: `q-1`,
      questionNumber: 1,
      totalQuestions: 5,
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
    const lowerAnswer = candidateAnswer.toLowerCase();

    let text = "";
    let isFollowUp = true;
    let category = "Adaptive Follow-up";

    // Analyze answer content to produce contextual follow-up
    if (lowerAnswer.includes("redis") || lowerAnswer.includes("cache") || lowerAnswer.includes("caching")) {
      text =
        "How did you determine that Redis caching was the right solution over alternative database optimizations, and how did you handle cache invalidation?";
    } else if (
      lowerAnswer.includes("performance") ||
      lowerAnswer.includes("slow") ||
      lowerAnswer.includes("latency") ||
      lowerAnswer.includes("bottleneck")
    ) {
      text =
        "What specific metrics did you measure before and after applying your performance fix, and how did you verify the bottleneck was resolved?";
    } else if (
      lowerAnswer.includes("team") ||
      lowerAnswer.includes("senior") ||
      lowerAnswer.includes("disagree") ||
      lowerAnswer.includes("conflict")
    ) {
      text =
        "How did you handle differing technical opinions within the team, and what steps did you take to reach a consensus?";
    } else if (
      lowerAnswer.includes("node") ||
      lowerAnswer.includes("react") ||
      lowerAnswer.includes("api") ||
      lowerAnswer.includes("database") ||
      lowerAnswer.includes("sql")
    ) {
      text =
        "What were the biggest architectural trade-offs you encountered with that stack during implementation?";
    } else {
      // General adaptive question based on question index
      const generalFollowUps = [
        "What was the most challenging obstacle you faced during that process, and how did you overcome it?",
        "If you were to rebuild that project today with your current knowledge, what would you do differently?",
        "How did you communicate your progress and technical trade-offs to non-technical stakeholders?",
        "What quantitative result or impact did that project have on your team or company metrics?",
      ];

      text = generalFollowUps[(questionNumber - 2) % generalFollowUps.length];
      if (questionNumber % 2 === 1) {
        isFollowUp = false;
        category = "Core Competency";
      }
    }

    return {
      id: `q-${questionNumber}`,
      questionNumber,
      totalQuestions: 5,
      text,
      category,
      isFollowUp,
    };
  }
}

export const adaptiveEngine = new MockAdaptiveEngine();
