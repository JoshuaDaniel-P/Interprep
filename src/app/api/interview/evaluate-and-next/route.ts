import { NextRequest, NextResponse } from "next/server";
import {
  Difficulty,
  InterviewConfig,
  QuestionEvaluation,
  QuestionType,
  RecordedQuestion,
} from "@/types/interview";
import { CandidateProfile } from "@/types/candidate";

interface EvaluateAndNextRequestBody {
  config: InterviewConfig;
  candidateProfile: CandidateProfile | null;
  previousQuestions: RecordedQuestion[];
  currentQuestion: {
    id: string;
    text: string;
    questionType?: QuestionType;
    difficulty?: Difficulty;
    isFollowUp?: boolean;
    questionNumber: number;
  };
  candidateAnswer: string;
  answerDuration: number;
  questionNumber: number;
  targetTotal?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EvaluateAndNextRequestBody;
    const {
      config,
      candidateProfile,
      previousQuestions = [],
      currentQuestion,
      candidateAnswer,
      answerDuration = 45,
      questionNumber = 1,
      targetTotal = 15,
    } = body;

    const apiKey = process.env.OPENAI_API_KEY;

    let evaluation: QuestionEvaluation;
    let isComplete = false;
    let nextQuestionData: {
      text: string;
      questionType: QuestionType;
      difficulty: Difficulty;
      category: string;
      isFollowUp: boolean;
      followUpQuestionRelationship?: string;
      yesNoOptions?: boolean;
    } | null = null;

    const shouldComplete = questionNumber >= targetTotal;

    if (apiKey) {
      try {
        const aiResult = await callOpenAIForEvaluationAndNext(
          apiKey,
          config,
          candidateProfile,
          previousQuestions,
          currentQuestion,
          candidateAnswer,
          questionNumber,
          targetTotal,
          shouldComplete
        );
        evaluation = aiResult.evaluation;
        isComplete = aiResult.isComplete;
        nextQuestionData = aiResult.nextQuestion;
      } catch (e) {
        console.warn("OpenAI API call failed or timed out, executing deterministic adaptive fallback:", e);
        const fallback = generateFallbackEvaluationAndNext(
          config,
          candidateProfile,
          previousQuestions,
          currentQuestion,
          candidateAnswer,
          questionNumber,
          targetTotal,
          shouldComplete
        );
        evaluation = fallback.evaluation;
        isComplete = fallback.isComplete;
        nextQuestionData = fallback.nextQuestion;
      }
    } else {
      const fallback = generateFallbackEvaluationAndNext(
        config,
        candidateProfile,
        previousQuestions,
        currentQuestion,
        candidateAnswer,
        questionNumber,
        targetTotal,
        shouldComplete
      );
      evaluation = fallback.evaluation;
      isComplete = fallback.isComplete;
      nextQuestionData = fallback.nextQuestion;
    }

    const recordedQuestion: RecordedQuestion = {
      id: currentQuestion.id || `q-${questionNumber}`,
      questionNumber,
      totalQuestions: targetTotal,
      question: currentQuestion.text,
      questionType: currentQuestion.questionType || "technical",
      difficulty: currentQuestion.difficulty || config.difficulty || "Medium",
      candidateAnswer,
      timestamp: new Date().toISOString(),
      answerDuration,
      evaluation,
      isFollowUp: !!currentQuestion.isFollowUp,
      followUpQuestionRelationship: currentQuestion.isFollowUp ? `Follows question ${questionNumber - 1}` : undefined,
    };

    return NextResponse.json({
      success: true,
      recordedQuestion,
      isComplete,
      nextQuestion: nextQuestionData
        ? {
            id: `q-${questionNumber + 1}`,
            questionNumber: questionNumber + 1,
            totalQuestions: targetTotal,
            ...nextQuestionData,
          }
        : null,
    });
  } catch (error) {
    console.error("evaluate-and-next error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to evaluate answer and generate next question. Please try again.",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// OpenAI Server-side Caller
// ---------------------------------------------------------------------------
async function callOpenAIForEvaluationAndNext(
  apiKey: string,
  config: InterviewConfig,
  profile: CandidateProfile | null,
  previousQuestions: RecordedQuestion[],
  currentQuestion: { text: string; questionType?: QuestionType; difficulty?: Difficulty; questionNumber: number },
  candidateAnswer: string,
  questionNumber: number,
  targetTotal: number,
  shouldComplete: boolean
) {
  const profileSummary = profile
    ? {
        name: profile.fullName,
        degree: profile.education?.degree,
        skills: profile.skills?.map((s) => `${s.name} (${s.proficiency})`),
        projects: profile.projects?.map((p) => ({
          name: p.name,
          tech: p.technologies,
          contribution: p.candidateContribution,
          problem: p.problemStatement,
          challenges: p.challenges,
        })),
        experience: profile.experience?.map((e) => `${e.position} at ${e.organization}`),
      }
    : "No detailed profile found; use role context only.";

  const recentHistory = previousQuestions.slice(-3).map((q) => ({
    q: q.question,
    type: q.questionType,
    a: q.candidateAnswer.slice(0, 150),
    score: q.evaluation.score,
  }));

  const systemPrompt = `You are an elite, adaptive technical and behavioral interviewer at PrepPilot.
You are interviewing for role: "${config.targetRole}" at company "${config.company || config.companyType}" (${config.companyType}).
Configured difficulty: "${config.difficulty}".
Target total questions: ~${targetTotal}. Current question number: ${questionNumber}.

CANDIDATE STORED PROFILE:
${JSON.stringify(profileSummary, null, 2)}

GUIDELINES:
1. Candidate-specific: Strictly use the candidate's actual projects (e.g. ESP32, React, Node.js) and skills. DO NOT invent unlisted projects.
2. Question mix: We need a realistic blend across ~15 questions:
   - Technical questions
   - Project questions (referencing their specific projects)
   - Candidate-specific questions
   - Behavioral questions
   - Situational questions
   - Role-specific questions
   - Company-oriented questions
   - Problem-solving questions
   - Short-answer questions
   - 2-4 Yes/No questions throughout the interview.
   If candidate answered a Yes/No question, your follow-up should delve into their answer (e.g. Yes -> "Tell me how...", No -> alternative approach).
3. Difficulty:
   - If "Easy": fundamental, straightforward wording.
   - If "Medium": practical fundamentals and standard trade-offs.
   - If "Hard": deep systems, architectural trade-offs, scale, failure modes.
   - If "Adaptive": increase difficulty if candidate score >= 7.5; maintain or ease if struggling (< 6.0).
4. Evaluate candidate's latest answer honestly across technical correctness, relevance, clarity, structure, conciseness (0-10 scale).
5. Output ONLY a valid JSON object matching the requested schema.`;

  const userPrompt = `
CURRENT QUESTION #${questionNumber}:
"${currentQuestion.text}"
(Type: ${currentQuestion.questionType || "general"})

CANDIDATE ANSWER:
"${candidateAnswer}"

PREVIOUS Q&A RECENT CONTEXT:
${JSON.stringify(recentHistory, null, 2)}

Evaluate this answer and ${shouldComplete ? "mark interview complete." : "generate the next question."}

Return JSON with structure:
{
  "evaluation": {
    "score": number (0-10),
    "technicalCorrectness": number (0-10),
    "relevance": number (0-10),
    "clarity": number (0-10),
    "structure": number (0-10),
    "conciseness": number (0-10),
    "confidenceIndicators": string,
    "strengths": string[],
    "weaknesses": string[],
    "missingInformation": string[],
    "feedback": string
  },
  "isComplete": boolean,
  "nextQuestion": {
    "text": string,
    "questionType": "technical" | "project" | "candidate_specific" | "behavioral" | "situational" | "role_specific" | "company_oriented" | "problem_solving" | "short_answer" | "yes_no",
    "difficulty": "Easy" | "Medium" | "Hard" | "Adaptive",
    "category": string,
    "isFollowUp": boolean,
    "followUpQuestionRelationship": string,
    "yesNoOptions": boolean
  } (or null if isComplete is true)
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed;
}

// ---------------------------------------------------------------------------
// Intelligent Deterministic Fallback Engine
// (Ensures 100% reliability, zero downtime, and complete candidate personalization)
// ---------------------------------------------------------------------------
function generateFallbackEvaluationAndNext(
  config: InterviewConfig,
  profile: CandidateProfile | null,
  previousQuestions: RecordedQuestion[],
  currentQuestion: { text: string; questionType?: QuestionType; difficulty?: Difficulty; questionNumber: number },
  candidateAnswer: string,
  questionNumber: number,
  targetTotal: number,
  shouldComplete: boolean
): {
  evaluation: QuestionEvaluation;
  isComplete: boolean;
  nextQuestion: {
    text: string;
    questionType: QuestionType;
    difficulty: Difficulty;
    category: string;
    isFollowUp: boolean;
    followUpQuestionRelationship?: string;
    yesNoOptions?: boolean;
  } | null;
} {
  const ans = candidateAnswer.trim();
  const wordCount = ans.split(/\s+/).filter(Boolean).length;
  const lowerAns = ans.toLowerCase();

  const isYesNo = currentQuestion.questionType === "yes_no" || /^(yes|no|yeah|nope|sure|never)[\s.,!]*$/i.test(ans);
  const isAffirmative = /^(yes|yeah|sure|definitely|i have|absolutely)/i.test(lowerAns);

  // Score computation
  let correctness = 7.0;
  let relevance = 7.0;
  let clarity = 7.0;
  let structure = 7.0;
  let conciseness = 7.5;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missingInfo: string[] = [];

  if (isYesNo) {
    correctness = 8.0;
    relevance = 8.5;
    clarity = 8.5;
    structure = 7.0;
    conciseness = 9.0;
    strengths.push("Direct and unambiguous response to the screening question.");
  } else {
    if (wordCount >= 30) {
      clarity += 0.5;
      structure += 0.5;
      strengths.push("Provided a detailed explanation with contextual background.");
    } else if (wordCount < 10) {
      clarity -= 1.5;
      structure -= 1.5;
      weaknesses.push("Answer was too brief; missed explaining rationale and specific actions.");
      missingInfo.push("Specific technical details and quantitative results.");
    }

    if (lowerAns.includes("because") || lowerAns.includes("due to") || lowerAns.includes("result") || lowerAns.includes("impact")) {
      correctness += 0.5;
      structure += 0.5;
      strengths.push("Effectively explained decision rationale and cause-and-effect.");
    }

    if (lowerAns.includes("redis") || lowerAns.includes("cache") || lowerAns.includes("database") || lowerAns.includes("api") || lowerAns.includes("latency")) {
      correctness += 0.8;
      strengths.push("Demonstrated sound understanding of backend architecture and performance constraints.");
    } else if (config.targetRole.includes("Frontend") && (lowerAns.includes("react") || lowerAns.includes("state") || lowerAns.includes("css") || lowerAns.includes("dom"))) {
      correctness += 0.8;
      strengths.push("Accurately discussed client-side state and rendering mechanics.");
    }

    if (wordCount > 120) {
      conciseness -= 1.5;
      weaknesses.push("Slightly verbose; practice focusing strictly on core problem and outcome.");
    }
  }

  correctness = Math.min(Math.max(correctness, 3), 9.6);
  relevance = Math.min(Math.max(relevance, 4), 9.8);
  clarity = Math.min(Math.max(clarity, 3), 9.5);
  structure = Math.min(Math.max(structure, 3), 9.5);
  conciseness = Math.min(Math.max(conciseness, 3), 9.5);

  const overallScore = Number(
    ((correctness * 0.35 + relevance * 0.25 + clarity * 0.15 + structure * 0.15 + conciseness * 0.1) || 7.2).toFixed(1)
  );

  const evaluation: QuestionEvaluation = {
    score: overallScore,
    technicalCorrectness: Number(correctness.toFixed(1)),
    relevance: Number(relevance.toFixed(1)),
    clarity: Number(clarity.toFixed(1)),
    structure: Number(structure.toFixed(1)),
    conciseness: Number(conciseness.toFixed(1)),
    confidenceIndicators:
      overallScore >= 7.5
        ? "Confident delivery with concrete technical references."
        : "Moderate confidence; could elaborate more firmly on tradeoffs.",
    strengths: strengths.length > 0 ? strengths : ["Demonstrated practical awareness of the subject."],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Consider framing responses with metrics and measurable impact."],
    missingInformation: missingInfo.length > 0 ? missingInfo : ["Deeper discussion of alternatives considered."],
    feedback: `Score: ${overallScore}/10. ${strengths[0] || ""} ${weaknesses[0] || ""}`.trim(),
  };

  if (shouldComplete) {
    return {
      evaluation,
      isComplete: true,
      nextQuestion: null,
    };
  }

  // Determine active difficulty
  let activeDifficulty: Difficulty = config.difficulty || "Medium";
  if (config.difficulty === "Adaptive") {
    if (overallScore >= 7.8) {
      activeDifficulty = "Hard";
    } else if (overallScore <= 5.5) {
      activeDifficulty = "Easy";
    } else {
      activeDifficulty = "Medium";
    }
  }

  // Check candidate profile for project references
  const firstProject = profile?.projects?.[0] || {
    name: "ESP32 Bus Tracking & Payment API",
    technologies: ["Node.js", "Redis", "ESP32", "PostgreSQL"],
    problemStatement: "Real-time tracking API for public transport buses under high concurrency.",
  };

  const companyName = config.company || config.companyType || "our engineering team";

  // Check if current question was Yes/No -> generate contextual follow-up
  if (isYesNo) {
    if (isAffirmative) {
      return {
        evaluation,
        isComplete: false,
        nextQuestion: {
          text: `Great. Tell me about how you applied that in a real scenario—what specific challenges arose and how did you resolve them?`,
          questionType: "situational" as QuestionType,
          difficulty: activeDifficulty,
          category: "Adaptive Follow-up",
          isFollowUp: true,
          followUpQuestionRelationship: `Direct follow-up to affirmative response on Q${questionNumber}`,
          yesNoOptions: false,
        },
      };
    } else {
      return {
        evaluation,
        isComplete: false,
        nextQuestion: {
          text: `Understood. When faced with a similar challenge or tool for the first time, what is your standard approach for getting up to speed quickly?`,
          questionType: "behavioral" as QuestionType,
          difficulty: activeDifficulty,
          category: "Adaptive Follow-up",
          isFollowUp: true,
          followUpQuestionRelationship: `Alternative follow-up to negative response on Q${questionNumber}`,
          yesNoOptions: false,
        },
      };
    }
  }

  // Realistic interview progression across 15 questions:
  // Q1: Overview / Introduction
  // Q2: Deep Dive into Candidate Project (ESP32 / Stored project)
  // Q3: Follow-up on project bottleneck / caching
  // Q4: Yes/No Question 1 (e.g. Git / Team PR workflow)
  // Q5: Follow-up to Q4 or Technical Problem Solving
  // Q6: Technical Architecture / Core role competency
  // Q7: Database / Data Handling trade-off
  // Q8: Company-oriented scenario (Target company context)
  // Q9: Behavioral / Conflict or Prioritization (STAR)
  // Q10: Yes/No Question 2 (Production incident / on-call experience)
  // Q11: Follow-up on production debugging / resilience
  // Q12: Situational / Agile deadline pressure
  // Q13: Deep technical scenario / Scaling bottleneck
  // Q14: Short-answer core technical check
  // Q15: Closing / Reflection and career alignment

  const questionIndex = questionNumber + 1; // target question index

  const questionCatalog: Record<
    number,
    {
      text: string;
      questionType: QuestionType;
      category: string;
      isFollowUp: boolean;
      yesNoOptions?: boolean;
    }
  > = {
    2: {
      text: `In your project "${firstProject.name}", how did you design the communication between the components (such as ${firstProject.technologies.slice(0, 2).join(" and ")}) and what communication protocol did you choose?`,
      questionType: "project",
      category: "Candidate Project",
      isFollowUp: false,
    },
    3: {
      text: `When optimizing "${firstProject.name}", what was the most significant bottleneck or failure scenario you identified, and what trade-offs did you make to resolve it?`,
      questionType: "candidate_specific",
      category: "Project Deep Dive",
      isFollowUp: true,
    },
    4: {
      text: `Have you ever collaborated in a multi-developer environment using feature branches and peer pull requests?`,
      questionType: "yes_no",
      category: "Workflow & Tooling",
      isFollowUp: false,
      yesNoOptions: true,
    },
    5: {
      text: `Can you walk me through an example of a technical disagreement during a code review or architecture discussion, and how you reached alignment?`,
      questionType: "behavioral",
      category: "Collaboration & Conflict",
      isFollowUp: false,
    },
    6: {
      text: `For a ${config.targetRole} role at ${companyName}, how would you ensure that your services maintain sub-100ms response times under unexpected traffic spikes?`,
      questionType: "technical",
      category: "System Architecture",
      isFollowUp: false,
    },
    7: {
      text: `Between normalized relational schemas and document/cache-based stores, how do you decide where persistent transactional state should live?`,
      questionType: "problem_solving",
      category: "Data Modeling & Storage",
      isFollowUp: false,
    },
    8: {
      text: `Why are you interested in joining ${companyName} specifically, and how do your technical background and career goals align with our team's mission?`,
      questionType: "company_oriented",
      category: "Company Alignment",
      isFollowUp: false,
    },
    9: {
      text: `Tell me about a time you made a technical mistake or introduced a bug that impacted users or tests. How did you catch it and what did you learn?`,
      questionType: "situational",
      category: "Ownership & Accountability",
      isFollowUp: false,
    },
    10: {
      text: `Have you ever worked directly with production monitoring, structured logging, or alerting systems?`,
      questionType: "yes_no",
      category: "Observability",
      isFollowUp: false,
      yesNoOptions: true,
    },
    11: {
      text: `When diagnosing an intermittent production issue where logs are sparse, what is your step-by-step troubleshooting methodology?`,
      questionType: "situational",
      category: "Problem Solving",
      isFollowUp: true,
    },
    12: {
      text: `Imagine you are assigned two high-priority deliverables due on the same day with tight deadlines. How do you communicate with stakeholders and prioritize?`,
      questionType: "behavioral",
      category: "Prioritization & Delivery",
      isFollowUp: false,
    },
    13: {
      text: `In system design, how would you design idempotent API endpoints to prevent duplicate payments or operations on network retries?`,
      questionType: "technical",
      category: "Advanced Technical",
      isFollowUp: false,
    },
    14: {
      text: `In 1 or 2 sentences: What is the primary difference between horizontal and vertical scaling, and when does vertical scaling fail?`,
      questionType: "short_answer",
      category: "Quick Technical Check",
      isFollowUp: false,
    },
    15: {
      text: `Looking back at your preparation for this ${config.targetRole} interview, what area do you feel you have mastered best, and what area are you currently working hardest to improve?`,
      questionType: "candidate_specific",
      category: "Self Reflection",
      isFollowUp: false,
    },
  };

  const nextQ: {
    text: string;
    questionType: QuestionType;
    category: string;
    isFollowUp: boolean;
    yesNoOptions?: boolean;
  } = questionCatalog[questionIndex] || {
    text: `Could you share an example of how you apply testing and continuous integration to ensure high code quality in ${config.targetRole} tasks?`,
    questionType: "technical",
    category: "Quality Engineering",
    isFollowUp: false,
  };

  return {
    evaluation,
    isComplete: false,
    nextQuestion: {
      text: nextQ.text,
      questionType: nextQ.questionType,
      difficulty: activeDifficulty,
      category: nextQ.category,
      isFollowUp: nextQ.isFollowUp,
      followUpQuestionRelationship: nextQ.isFollowUp ? `Follows question ${questionNumber}` : undefined,
      yesNoOptions: !!nextQ.yesNoOptions,
    },
  };
}
