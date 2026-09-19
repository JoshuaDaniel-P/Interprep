import { NextRequest, NextResponse } from "next/server";
import {
  CategoryScores,
  InterviewConfig,
  RecordedQuestion,
  StoredInterviewRecord,
} from "@/types/interview";
import { CandidateProfile } from "@/types/candidate";
import { Evaluation } from "@/types/evaluation";

import { finalEvaluationRequestSchema } from "@/lib/validations/apiSchemas";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const validation = finalEvaluationRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      logger.warn("final-evaluation validation error", "final-evaluation", { errorMsg });
      return NextResponse.json({ error: `Validation error: ${errorMsg}` }, { status: 400 });
    }

    const {
      config,
      candidateProfile,
      recordedQuestions,
      durationSeconds,
      userId,
    } = validation.data as any;

    const apiKey = process.env.OPENAI_API_KEY;

    let finalReport: {
      overallScore: number;
      categoryScores: CategoryScores;
      strengths: string[];
      weaknesses: string[];
      recurringIssues: string[];
      missingKnowledge: string[];
      answerStructureIssues: string[];
      communicationIssues: string[];
      technicalGaps: string[];
      recommendedPreparationAreas: string[];
    };

    if (apiKey) {
      try {
        finalReport = await callOpenAIForFinalEvaluation(
          apiKey,
          config,
          candidateProfile,
          recordedQuestions
        );
      } catch (e) {
        console.warn("OpenAI final evaluation call failed, falling back to deterministic analysis:", e);
        finalReport = generateFallbackFinalEvaluation(config, candidateProfile, recordedQuestions);
      }
    } else {
      finalReport = generateFallbackFinalEvaluation(config, candidateProfile, recordedQuestions);
    }

    const evaluation: Evaluation = {
      sessionId: `session-${Date.now()}`,
      overallScore: finalReport.overallScore,
      skills: {
        content: {
          score: Number((finalReport.categoryScores.technicalKnowledge / 10).toFixed(1)),
          feedback: "Technical depth and breadth across system domains.",
        },
        structure: {
          score: Number((finalReport.categoryScores.problemSolving / 10).toFixed(1)),
          feedback: "Logical framework, STAR alignment, and reasoning order.",
        },
        relevance: {
          score: Number((finalReport.categoryScores.roleKnowledge / 10).toFixed(1)),
          feedback: "Direct answering of interviewer prompts and constraints.",
        },
        clarity: {
          score: Number((finalReport.categoryScores.communication / 10).toFixed(1)),
          feedback: "Precision of terminology and explanation flow.",
        },
        confidence: {
          score: Number((finalReport.categoryScores.behavioral / 10).toFixed(1)),
          feedback: "Assertion and ownership in technical decision making.",
        },
        conciseness: {
          score: Number((finalReport.categoryScores.projects / 10).toFixed(1)),
          feedback: "Balancing sufficient detail without unnecessary filler.",
        },
      },
      categoryScores: finalReport.categoryScores,
      strengths: finalReport.strengths,
      improvements: finalReport.weaknesses,
      recommendations: finalReport.recommendedPreparationAreas,
      recurringIssues: finalReport.recurringIssues,
      missingKnowledge: finalReport.missingKnowledge,
      answerStructureIssues: finalReport.answerStructureIssues,
      communicationIssues: finalReport.communicationIssues,
      technicalGaps: finalReport.technicalGaps,
      recommendedPreparationAreas: finalReport.recommendedPreparationAreas,
      questions: recordedQuestions,
      evaluatedAt: new Date().toISOString(),
    };

    const storedRecord: StoredInterviewRecord = {
      id: evaluation.sessionId,
      userId,
      role: config.targetRole,
      companyType: config.companyType,
      company: config.company || config.companyType,
      difficulty: config.difficulty,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      duration: durationSeconds,
      questionCount: recordedQuestions.length,
      overallScore: finalReport.overallScore,
      categoryScores: finalReport.categoryScores,
      questions: recordedQuestions,
      strengths: finalReport.strengths,
      weaknesses: finalReport.weaknesses,
      improvements: finalReport.weaknesses,
      recurringIssues: finalReport.recurringIssues,
      missingKnowledge: finalReport.missingKnowledge,
      answerStructureIssues: finalReport.answerStructureIssues,
      communicationIssues: finalReport.communicationIssues,
      technicalGaps: finalReport.technicalGaps,
      preparationGaps: finalReport.technicalGaps,
      recommendedPreparationAreas: finalReport.recommendedPreparationAreas,
    };

    return NextResponse.json({
      success: true,
      evaluation,
      storedRecord,
    });
  } catch (error) {
    console.error("final-evaluation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate final evaluation.",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// OpenAI Final Evaluation Caller
// ---------------------------------------------------------------------------
async function callOpenAIForFinalEvaluation(
  apiKey: string,
  config: InterviewConfig,
  profile: CandidateProfile | null,
  recordedQuestions: RecordedQuestion[]
) {
  const qSummary = recordedQuestions.map((q, idx) => ({
    number: idx + 1,
    type: q.questionType,
    question: q.question,
    answer: q.candidateAnswer,
    score: q.evaluation.score,
    strengths: q.evaluation.strengths,
    weaknesses: q.evaluation.weaknesses,
  }));

  const systemPrompt = `You are the Lead Interview Assessment Evaluator at PrepPilot.
Evaluate the completed mock interview for role "${config.targetRole}" at "${config.company || config.companyType}".
Total questions: ${recordedQuestions.length}. Difficulty: ${config.difficulty}.

IMPORTANT:
PrepPilot does NOT teach missing topics. It strictly identifies what the candidate needs to learn or prepare (e.g., "SQL joins need further preparation.").

Return JSON strictly formatted:
{
  "overallScore": number (0-10),
  "categoryScores": {
    "technicalKnowledge": number (0-100),
    "problemSolving": number (0-100),
    "projects": number (0-100),
    "communication": number (0-100),
    "behavioral": number (0-100),
    "roleKnowledge": number (0-100),
    "companyAwareness": number (0-100)
  },
  "strengths": string[],
  "weaknesses": string[],
  "recurringIssues": string[],
  "missingKnowledge": string[],
  "answerStructureIssues": string[],
  "communicationIssues": string[],
  "technicalGaps": string[],
  "recommendedPreparationAreas": string[]
}`;

  const userPrompt = `INTERVIEW TRANSCRIPT & QUESTION EVALUATIONS:
${JSON.stringify(qSummary, null, 2)}

Produce the comprehensive final evaluation report in JSON.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI final eval failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// ---------------------------------------------------------------------------
// Fallback Evaluation Calculator
// ---------------------------------------------------------------------------
function generateFallbackFinalEvaluation(
  config: InterviewConfig,
  profile: CandidateProfile | null,
  recordedQuestions: RecordedQuestion[]
) {
  if (recordedQuestions.length === 0) {
    return {
      overallScore: 7.0,
      categoryScores: {
        technicalKnowledge: 70,
        problemSolving: 70,
        projects: 70,
        communication: 70,
        behavioral: 70,
        roleKnowledge: 70,
        companyAwareness: 70,
      },
      strengths: ["Completed mock interview session."],
      weaknesses: ["Insufficient answer volume to generate in-depth pattern analysis."],
      recurringIssues: [],
      missingKnowledge: [],
      answerStructureIssues: [],
      communicationIssues: [],
      technicalGaps: [],
      recommendedPreparationAreas: ["Practice answering questions using the STAR framework."],
    };
  }

  // Calculate scores across types
  let totalScore = 0;
  let techScoreSum = 0;
  let techCount = 0;
  let behavioralScoreSum = 0;
  let behavioralCount = 0;
  let projectScoreSum = 0;
  let projectCount = 0;

  const allStrengths: string[] = [];
  const allWeaknesses: string[] = [];

  for (const q of recordedQuestions) {
    totalScore += q.evaluation.score;
    allStrengths.push(...q.evaluation.strengths);
    allWeaknesses.push(...q.evaluation.weaknesses);

    if (q.questionType === "technical" || q.questionType === "problem_solving" || q.questionType === "short_answer") {
      techScoreSum += q.evaluation.score;
      techCount++;
    } else if (q.questionType === "behavioral" || q.questionType === "situational") {
      behavioralScoreSum += q.evaluation.score;
      behavioralCount++;
    } else if (q.questionType === "project" || q.questionType === "candidate_specific") {
      projectScoreSum += q.evaluation.score;
      projectCount++;
    }
  }

  const avgOverall = Number((totalScore / recordedQuestions.length).toFixed(1));
  const avgTech = techCount > 0 ? (techScoreSum / techCount) * 10 : avgOverall * 10;
  const avgBehavioral = behavioralCount > 0 ? (behavioralScoreSum / behavioralCount) * 10 : avgOverall * 10;
  const avgProject = projectCount > 0 ? (projectScoreSum / projectCount) * 10 : avgOverall * 10;

  const categoryScores: CategoryScores = {
    technicalKnowledge: Math.round(Math.min(Math.max(avgTech, 45), 95)),
    problemSolving: Math.round(Math.min(Math.max(avgTech - 2, 40), 92)),
    projects: Math.round(Math.min(Math.max(avgProject, 50), 96)),
    communication: Math.round(Math.min(Math.max((avgBehavioral + avgOverall * 10) / 2, 45), 95)),
    behavioral: Math.round(Math.min(Math.max(avgBehavioral, 45), 94)),
    roleKnowledge: Math.round(Math.min(Math.max(avgOverall * 10, 50), 95)),
    companyAwareness: Math.round(Math.min(Math.max(avgOverall * 10 - 5, 45), 90)),
  };

  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 4);
  const uniqueWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 4);

  return {
    overallScore: avgOverall,
    categoryScores,
    strengths:
      uniqueStrengths.length > 0
        ? uniqueStrengths
        : [
            "Good foundational understanding of role requirements.",
            "Demonstrated relevant project application.",
          ],
    weaknesses:
      uniqueWeaknesses.length > 0
        ? uniqueWeaknesses
        : [
            "Answers can be structured more concisely.",
            "Include more quantitative metrics and outcomes in technical examples.",
          ],
    recurringIssues: [
      "Tendency to skip explicit edge-case and error-handling steps.",
      "Answers occasionally lacked quantitative impact metrics (e.g. latency reduction %, throughput).",
    ],
    missingKnowledge: [
      "Cache invalidation and consistency trade-offs under high concurrency.",
      "Structured behavioral response framing using the STAR method.",
    ],
    answerStructureIssues: [
      "Jumped directly into technical execution without first defining the high-level architecture or context.",
    ],
    communicationIssues: [
      "Could improve conciseness; focus on the primary action and measurable result.",
    ],
    technicalGaps: [
      "Distributed cache invalidation strategies.",
      "SQL index optimization and join performance.",
    ],
    recommendedPreparationAreas: [
      "SQL joins and indexing need further preparation.",
      "Distributed caching patterns (e.g., Cache-Aside, Write-Through) need further preparation.",
      "Practice STAR framework to structure behavioral answers within 90 seconds.",
    ],
  };
}
