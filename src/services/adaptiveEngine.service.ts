import { InterviewConfig, InterviewQuestion } from "@/types/interview";
import { CandidateProfile } from "@/types/candidate";

export function getStreamQuestionCount(config: InterviewConfig): number {
  if (config.questionCount && config.questionCount > 0) {
    return config.questionCount;
  }

  // Stream-specific dynamic question length
  if (config.interviewType === "HR" || config.targetRole === "Marketing" || config.targetRole === "Sales") {
    return 4;
  }
  if (config.interviewType === "Mixed" || config.targetRole === "Software Engineer" || config.targetRole === "Software Developer") {
    return 6;
  }
  return 5; // Standard technical streams (Frontend, Backend, Data Analyst, Data Scientist, UI Designer, Product Manager)
}

export interface IAdaptiveEngine {
  generateInitialQuestion(config: InterviewConfig, profile?: CandidateProfile | null): InterviewQuestion;
  generateFollowUpQuestion(
    config: InterviewConfig,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string,
    profile?: CandidateProfile | null
  ): InterviewQuestion;
}

export class AdaptiveEngineService implements IAdaptiveEngine {
  generateInitialQuestion(config: InterviewConfig, profile?: CandidateProfile | null): InterviewQuestion {
    const totalQuestions = getStreamQuestionCount(config);
    const candidateName = profile?.fullName?.trim() ? profile.fullName.trim() : "Candidate";
    const companyName = config.company?.trim() || config.companyType || "our tech team";

    // 1. If launched from a Course Roadmap Module:
    if (config.practicePrompt) {
      return {
        id: "q-1",
        questionNumber: 1,
        totalQuestions,
        text: `Welcome ${candidateName}. For this focused practice module on "${config.moduleTopic || "Core Competency"}", let's start with this scenario: ${config.practicePrompt}`,
        category: config.moduleTopic || "Module Practice",
        isFollowUp: false,
      };
    }

    // 2. If Candidate Profile has declared project(s):
    const primaryProject = profile?.projects?.[0];
    if (primaryProject && primaryProject.name) {
      const techStack = primaryProject.technologies?.slice(0, 3).join(", ") || "the tech stack";
      const challenge = primaryProject.challenges || primaryProject.problemStatement || "a key technical bottleneck";

      return {
        id: "q-1",
        questionNumber: 1,
        totalQuestions,
        text: `Welcome ${candidateName}. I'm reviewing your background for the ${config.targetRole} role at ${companyName}. In your project "${primaryProject.name}" (${techStack}), you tackled "${challenge}". Could you walk me through the system architecture you designed and explain your specific individual contribution?`,
        category: "Candidate Project Deep Dive",
        isFollowUp: false,
      };
    }

    // 3. If Candidate Profile has education or skills:
    const topSkills = profile?.skills?.map((s) => s.name).slice(0, 3).join(", ");
    if (topSkills && profile?.education?.institution) {
      return {
        id: "q-1",
        questionNumber: 1,
        totalQuestions,
        text: `Welcome ${candidateName}. In your background at ${profile.education.institution} preparing for ${config.targetRole} opportunities at ${companyName}, you've built expertise in ${topSkills}. Could you share a complex project or technical challenge where you applied these skills to deliver a measurable outcome?`,
        category: "Background & Technical Foundation",
        isFollowUp: false,
      };
    }

    // 4. Role-specific personalized opening tailored to target job & company
    const roleQuestions: Record<string, string> = {
      "Software Engineer":
        `Welcome ${candidateName}. For our ${config.targetRole} position at ${companyName}, could you walk me through the most technically complex software system or service you designed, the key architectural decisions you made, and how you verified its reliability?`,
      "Software Developer":
        `Welcome ${candidateName}. Interviewing for the ${config.targetRole} role at ${companyName}, could you tell me about a core application or backend service you engineered end-to-end? What data structures and APIs did you build, and how did you handle edge cases?`,
      "Frontend Developer":
        `Welcome ${candidateName}. For our Frontend Developer role at ${companyName}, could you walk me through a modern client-side application you built with React/Next.js? How did you structure your components, manage asynchronous state, and optimize Core Web Vitals (LCP, INP)?`,
      "Backend Developer":
        `Welcome ${candidateName}. For our Backend Developer position at ${companyName}, describe a REST or GraphQL service you developed. How did you structure database queries, manage caching and concurrency, and prevent downtime under sudden traffic surges?`,
      "Data Scientist":
        `Welcome ${candidateName}. Interviewing for Data Scientist at ${companyName}, could you describe an end-to-end machine learning or predictive modeling pipeline you built? How did you handle feature engineering, evaluate model trade-offs (e.g. Precision vs Recall), and ensure model reliability?`,
      "Data Analyst":
        `Welcome ${candidateName}. For our Data Analyst opening at ${companyName}, walk me through a data initiative where you transformed messy, unstructured datasets into executive business intelligence dashboards. What quantitative insights did you discover?`,
      "UI Designer":
        `Welcome ${candidateName}. For our UI/UX Designer role at ${companyName}, could you present a product feature or design system project you designed from user research to high-fidelity Figma prototype? How did you balance user empathy with technical feasibility and WCAG accessibility?`,
      "Product Manager":
        `Welcome ${candidateName}. In this Product Manager interview for ${companyName}, tell me about a product feature or MVP you led from problem discovery through launch. How did you define success metrics, prioritize the roadmap, and resolve conflicting stakeholder requests?`,
      "College Lecturer":
        `Welcome ${candidateName}. For this academic teaching role, how do you introduce complex, abstract technical topics to first-year students who have no prior programming experience? What pedagogical strategies do you use to evaluate understanding?`,
      Marketing:
        `Welcome ${candidateName}. For this Marketing role at ${companyName}, describe a high-performing growth or acquisition campaign you led. What channels did you prioritize, and how did you track CAC, conversion funnels, and ROI?`,
      Sales:
        `Welcome ${candidateName}. For this Sales role at ${companyName}, tell me about a high-stakes deal or enterprise client pitch you closed. How did you uncover their underlying pain points and overcome tough pricing or competitive objections?`,
    };

    const text =
      roleQuestions[config.targetRole] ||
      `Welcome ${candidateName}. Tell me about a core project you spearheaded as a ${config.targetRole} targeting ${companyName} and what your specific technical contributions were.`;

    return {
      id: "q-1",
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
    candidateAnswer: string,
    profile?: CandidateProfile | null
  ): InterviewQuestion {
    const totalQuestions = getStreamQuestionCount(config);
    const lowerAnswer = candidateAnswer.toLowerCase();
    const wordCount = candidateAnswer.trim().split(/\s+/).filter(Boolean).length;
    const companyName = config.company?.trim() || config.companyType || "our team";
    const primaryProject = profile?.projects?.[0];

    let text = "";
    let isFollowUp = true;
    let category = "Adaptive Follow-up";

    // 1. If candidate gave a very brief answer (< 18 words), challenge them using the STAR framework
    if (wordCount < 18) {
      text =
        "That touches on the surface, but in an interview setting we look for concrete detail. Using the STAR framework (Situation, Task, Action, Result), what specific actions did you personally execute, and what was the measurable outcome?";
      category = "STAR Structure Probing";
      return {
        id: `q-${questionNumber}`,
        questionNumber,
        totalQuestions,
        text,
        category,
        isFollowUp: true,
      };
    }

    // 2. Probing Candidate Project on early questions if available
    if (questionNumber === 2 && primaryProject?.name) {
      text = `Regarding "${primaryProject.name}", you mentioned your contribution in ${primaryProject.candidateContribution || "development"}. What was the single biggest engineering bottleneck or failure scenario you encountered, and what concrete technical trade-offs did you evaluate to fix it?`;
      category = "Project Failure & Trade-offs";
      return {
        id: `q-${questionNumber}`,
        questionNumber,
        totalQuestions,
        text,
        category,
        isFollowUp: true,
      };
    }

    // 3. Contextual probing based on candidate's exact answer keywords
    if (lowerAnswer.includes("redis") || lowerAnswer.includes("cache") || lowerAnswer.includes("caching")) {
      text =
        "How did you determine that caching was the appropriate bottleneck remedy over database indexing or query optimization, and how did you handle cache invalidation and stale read replicas?";
      category = "Caching & Invalidation";
    } else if (
      lowerAnswer.includes("latency") ||
      lowerAnswer.includes("performance") ||
      lowerAnswer.includes("slow") ||
      lowerAnswer.includes("bottleneck") ||
      lowerAnswer.includes("p95") ||
      lowerAnswer.includes("p99")
    ) {
      text =
        "What specific quantitative metrics (such as p95/p99 latency, query execution time, or render FPS) did you benchmark before and after your optimization, and how did you isolate the root cause?";
      category = "Performance Diagnostics";
    } else if (
      lowerAnswer.includes("team") ||
      lowerAnswer.includes("senior") ||
      lowerAnswer.includes("disagree") ||
      lowerAnswer.includes("conflict") ||
      lowerAnswer.includes("pr") ||
      lowerAnswer.includes("review")
    ) {
      text =
        "When technical disagreements arose regarding architecture, code review comments, or timelines, what concrete process did you follow to de-escalate, present evidence, and align the team on a decision?";
      category = "Collaboration & Conflict";
    } else if (
      lowerAnswer.includes("database") ||
      lowerAnswer.includes("sql") ||
      lowerAnswer.includes("postgres") ||
      lowerAnswer.includes("mongodb") ||
      lowerAnswer.includes("nosql") ||
      lowerAnswer.includes("schema")
    ) {
      text =
        "How did you structure your schema and indexing strategy for high-concurrency read/write workloads, and what trade-offs did you weigh between transactional consistency and query speed?";
      category = "Data Modeling & Storage";
    } else if (
      lowerAnswer.includes("react") ||
      lowerAnswer.includes("next") ||
      lowerAnswer.includes("state") ||
      lowerAnswer.includes("component") ||
      lowerAnswer.includes("render")
    ) {
      text =
        "How did you prevent unnecessary re-renders, structure your client/server component boundary, and ensure accessibility (WCAG 2.1) across screen sizes?";
      category = "Client-Side Architecture";
    } else if (
      lowerAnswer.includes("model") ||
      lowerAnswer.includes("dataset") ||
      lowerAnswer.includes("train") ||
      lowerAnswer.includes("precision") ||
      lowerAnswer.includes("recall") ||
      lowerAnswer.includes("feature")
    ) {
      text =
        "How did you handle class imbalance or data drift, and what led you to choose that particular algorithm over simpler baselines or ensemble techniques?";
      category = "Model Evaluation & Trade-offs";
    } else if (
      lowerAnswer.includes("figma") ||
      lowerAnswer.includes("user") ||
      lowerAnswer.includes("prototype") ||
      lowerAnswer.includes("design") ||
      lowerAnswer.includes("wireframe")
    ) {
      text =
        "Walk me through a piece of critical user testing feedback that forced you to pivot your design. How did you iterate on the user journey while maintaining engineering feasibility?";
      category = "Design Iteration & Usability";
    } else if (
      lowerAnswer.includes("metric") ||
      lowerAnswer.includes("kpi") ||
      lowerAnswer.includes("conversion") ||
      lowerAnswer.includes("churn") ||
      lowerAnswer.includes("roi")
    ) {
      text =
        "What unexpected user trends or metric fluctuations did you discover post-rollout, and how did that telemetry shape your subsequent prioritization?";
      category = "Product Analytics & Telemetry";
    } else {
      // Stream-specific dynamic question bank tailored to target job & company
      const rolePools: Record<string, string[]> = {
        "Frontend Developer": [
          `For our Frontend team at ${companyName}, how do you structure custom hooks, state stores, and error boundaries so other engineers can build features without introducing regressions?`,
          "Can you walk me through a situation where a third-party script or heavy dependency hurt your page load speed? How did you diagnose and remediate it?",
          "How do you design front-end components to be resilient against slow or failing backend API endpoints?",
        ],
        "Backend Developer": [
          `In a ${config.targetRole} role at ${companyName}, how would you design idempotent API endpoints to prevent double-processing on network retries?`,
          "What is your approach to handling database migrations on large live tables without causing downtime or table locks?",
          "How do you configure structured logging, distributed tracing, and automated alerting to catch silent failures in production?",
        ],
        "Software Engineer": [
          `In system architecture for ${companyName}, between horizontal scaling and vertical scaling, where does vertical scaling hit a wall and how do you partition stateless vs stateful services?`,
          "Describe a time you made a significant architectural mistake or introduced a production bug. How did you discover it, remediate it, and prevent recurrence?",
          "How do you balance rapid feature delivery against addressing accumulated technical debt?",
        ],
        "Software Developer": [
          `In your day-to-day work at ${companyName}, what testing practices (unit, integration, mocking) do you enforce before opening a pull request?`,
          "How do you approach learning and integrating an unfamiliar library or framework under strict project deadlines?",
          "Can you walk me through how you optimize an endpoint or function from O(N^2) to O(N log N) or O(N)?",
        ],
        "Data Scientist": [
          `At ${companyName}, models operate on production streaming or batch data. How do you detect and mitigate model performance degradation and data drift?`,
          "When communicating complex statistical modeling or deep learning outputs to non-technical product leads, how do you frame your findings?",
          "How do you prevent data leakage when engineering features on time-series or user interaction records?",
        ],
        "Data Analyst": [
          `If an executive at ${companyName} notices a 15% dip in daily active users, walk me through your step-by-step analytical process to isolate the root cause.`,
          "How do you ensure data integrity when merging datasets with missing identifiers or inconsistent schemas?",
          "What visualization frameworks do you choose when presenting high-variance operational metrics?",
        ],
        "UI Designer": [
          `How do you collaborate with front-end developers at ${companyName} to make sure your Figma tokens, responsive grids, and interaction states are implemented pixel-accurately?`,
          "Describe your user research protocol when starting a project in an unfamiliar domain with limited user access.",
          "How do you design for internationalization, accessibility, and high-contrast dark modes in product design?",
        ],
        "Product Manager": [
          `At ${companyName}, if engineering estimates a strategic feature will take 3 months longer than expected, how do you de-scope or re-negotiate with leadership?`,
          "Walk me through how you construct a PRD (Product Requirements Document) and communicate non-functional requirements to engineering.",
          "How do you distinguish between user-expressed wants and underlying user needs?",
        ],
        "College Lecturer": [
          "How do you keep students engaged during technically dense lectures, and how do you support struggling students without slowing the curriculum?",
          "Can you describe a rubric you created that fairly assesses both code correctness and code readability?",
          "How do you incorporate industry-standard tools (like Git and cloud platforms) into foundational classroom coursework?",
        ],
      };

      const defaultPool = [
        `What has been the most demanding technical obstacle in your recent work, and what methodology did you employ to overcome it?`,
        `If you were tasked with building that system again today for ${companyName}, what design choices would you reconsider?`,
        `How do you ensure your code and documentation remain maintainable and understandable for future engineers on your team?`,
        `Why are you interested in joining ${companyName} specifically, and how does this role align with your technical growth goals?`,
      ];

      const pool = rolePools[config.targetRole] || defaultPool;
      text = pool[(questionNumber - 2) % pool.length];

      if (questionNumber === totalQuestions) {
        text = `Looking back across your preparation and background targeting ${companyName}, what is one technical area you consider your strongest competitive asset, and what is one area you are actively leveling up in?`;
        category = "Self-Reflection & Career Alignment";
        isFollowUp = false;
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
