import { NextRequest, NextResponse } from "next/server";
import {
  Difficulty,
  InterviewConfig,
  QuestionEvaluation,
  QuestionType,
  RecordedQuestion,
} from "@/types/interview";
import { CandidateProfile } from "@/types/candidate";
import { adaptiveEngine } from "@/services/adaptiveEngine.service";

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
      targetTotal = 5,
    } = body;

    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

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

    // -------------------------------------------------------------------------
    // Hybrid Architecture:
    // Tier 1: Cloud LLM (Gemini 1.5/2.0 Flash or OpenAI GPT-4o-mini if keys present)
    // Tier 2: Real-time on-device personalized heuristic persona engine (100% offline & reliable)
    // -------------------------------------------------------------------------
    let aiSucceeded = false;

    if (geminiKey) {
      try {
        const geminiResult = await callGeminiForEvaluationAndNext(
          geminiKey,
          config,
          candidateProfile,
          previousQuestions,
          currentQuestion,
          candidateAnswer,
          questionNumber,
          targetTotal,
          shouldComplete
        );
        evaluation = geminiResult.evaluation;
        isComplete = geminiResult.isComplete;
        nextQuestionData = geminiResult.nextQuestion;
        aiSucceeded = true;
      } catch (e) {
        console.warn("Gemini API call failed, falling back to next tier:", e);
      }
    }

    if (!aiSucceeded && openAiKey) {
      try {
        const openAiResult = await callOpenAIForEvaluationAndNext(
          openAiKey,
          config,
          candidateProfile,
          previousQuestions,
          currentQuestion,
          candidateAnswer,
          questionNumber,
          targetTotal,
          shouldComplete
        );
        evaluation = openAiResult.evaluation;
        isComplete = openAiResult.isComplete;
        nextQuestionData = openAiResult.nextQuestion;
        aiSucceeded = true;
      } catch (e) {
        console.warn("OpenAI API call failed, falling back to heuristic engine:", e);
      }
    }

    if (!aiSucceeded) {
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
      evaluation: evaluation!,
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
// Helper: Candidate Profile Context Formatter
// ---------------------------------------------------------------------------
function buildCandidateContext(config: InterviewConfig, profile: CandidateProfile | null) {
  return {
    targetRole: config.targetRole,
    targetCompany: config.company || config.companyType,
    difficulty: config.difficulty,
    moduleFocus: config.moduleTopic || "Standard Stream",
    practicePrompt: config.practicePrompt || null,
    candidateName: profile?.fullName || "Candidate",
    degree: profile?.education?.degree || "Engineering / Science",
    institution: profile?.education?.institution || "University",
    skills: profile?.skills?.map((s) => `${s.name} (${s.proficiency})`) || [],
    projects: profile?.projects?.map((p) => ({
      name: p.name,
      tech: p.technologies,
      contribution: p.candidateContribution,
      problem: p.problemStatement,
      challenges: p.challenges,
      results: p.results,
    })) || [],
    experience: profile?.experience?.map((e) => `${e.position} at ${e.organization}`) || [],
  };
}

// ---------------------------------------------------------------------------
// Tier 1A: Google Gemini API Caller
// ---------------------------------------------------------------------------
async function callGeminiForEvaluationAndNext(
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
  const context = buildCandidateContext(config, profile);
  const prompt = `You are an expert AI interviewer at PrepPilot conducting a mock interview for the role "${config.targetRole}" at "${context.targetCompany}".
Difficulty level: ${config.difficulty}. Target Total Questions: ${targetTotal}. Current Question: #${questionNumber}.

CANDIDATE CONTEXT:
${JSON.stringify(context, null, 2)}

QUESTION ASKED: "${currentQuestion.text}"
CANDIDATE ANSWER: "${candidateAnswer}"

PREVIOUS Q&A:
${JSON.stringify(previousQuestions.slice(-2).map((q) => ({ q: q.question, a: q.candidateAnswer })), null, 2)}

INSTRUCTIONS:
1. Evaluate the candidate's answer based on STAR methodology, technical correctness, clarity, and relevance (scores 0-10).
2. If shouldComplete is true or questionNumber >= ${targetTotal}, mark "isComplete": true and "nextQuestion": null.
3. Otherwise, formulate the next adaptive question specifically tailored to their background, target job ("${config.targetRole}"), and their previous answers. If they mentioned specific tools or projects, probe deeper.
4. Output strictly valid JSON matching this schema:
{
  "evaluation": {
    "score": number,
    "technicalCorrectness": number,
    "relevance": number,
    "clarity": number,
    "structure": number,
    "conciseness": number,
    "confidenceIndicators": string,
    "strengths": string[],
    "weaknesses": string[],
    "missingInformation": string[],
    "feedback": string
  },
  "isComplete": boolean,
  "nextQuestion": {
    "text": string,
    "questionType": string,
    "difficulty": string,
    "category": string,
    "isFollowUp": boolean,
    "followUpQuestionRelationship": string,
    "yesNoOptions": boolean
  } or null
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.4,
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawText);
}

// ---------------------------------------------------------------------------
// Tier 1B: OpenAI API Caller
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
  const context = buildCandidateContext(config, profile);

  const systemPrompt = `You are an elite, adaptive technical and behavioral interviewer at PrepPilot.
Interviewing for: "${config.targetRole}" at "${context.targetCompany}".
Difficulty: "${config.difficulty}".
CANDIDATE BACKGROUND:
${JSON.stringify(context, null, 2)}
Output strictly valid JSON.`;

  const userPrompt = `
CURRENT QUESTION #${questionNumber}: "${currentQuestion.text}"
CANDIDATE ANSWER: "${candidateAnswer}"

Evaluate this answer and ${shouldComplete ? "mark interview complete." : "generate the next question tailored to their target job and background."}

JSON schema:
{
  "evaluation": {
    "score": number,
    "technicalCorrectness": number,
    "relevance": number,
    "clarity": number,
    "structure": number,
    "conciseness": number,
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
    throw new Error(`OpenAI API error (${response.status})`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// ---------------------------------------------------------------------------
// Tier 2: Hybrid Real-Time Heuristic Engine
// (100% Reliable, zero latency, personalized to candidate info, target job, and course modules)
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
  const lowerAns = ans.toLowerCase();
  const words = lowerAns.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const isYesNo = currentQuestion.questionType === "yes_no" || /^(yes|no|yeah|nope|sure|never)[\s.,!]*$/i.test(ans);
  const dismissivePhrases = [
    "don't know", "dont know", "no idea", "idk", "not sure", "nothing",
    "pass", "skip", "i have no clue", "dunno", "can't answer", "asdf"
  ];
  const isDismissive = dismissivePhrases.some((phrase) => lowerAns.includes(phrase));

  let correctness: number;
  let relevance: number;
  let clarity: number;
  let structure: number;
  let conciseness: number;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missingInfo: string[] = [];

  if (isDismissive || wordCount < 4) {
    // Honest low score for missing or non-answers
    correctness = 1.5;
    relevance = 2.0;
    clarity = 2.5;
    structure = 1.5;
    conciseness = 4.0;
    weaknesses.push("Response was incomplete or indicated unfamiliarity with the concept.");
    missingInfo.push("Core definitions, fundamental mechanisms, and step-by-step reasoning.");
  } else if (wordCount < 18) {
    if (isYesNo) {
      correctness = 7.5;
      relevance = 8.0;
      clarity = 8.0;
      structure = 7.0;
      conciseness = 9.0;
      strengths.push("Direct, decisive response to the screening scenario.");
    } else {
      correctness = 3.8;
      relevance = 4.5;
      clarity = 4.5;
      structure = 3.5;
      conciseness = 6.0;
      weaknesses.push("Answer identified the topic but lacked explanation of underlying principles, actions, and trade-offs.");
      missingInfo.push("Concrete examples, implementation details, and rationale.");
      if (lowerAns.includes("because") || lowerAns.includes("api") || lowerAns.includes("sql") || lowerAns.includes("component")) {
        correctness += 1.0;
        relevance += 1.0;
      }
    }
  } else {
    // Substantial answer: evaluate depth, relevance, STAR keywords
    correctness = 6.8;
    relevance = 7.0;
    clarity = 6.8;
    structure = 6.5;
    conciseness = 7.2;

    if (wordCount >= 30 && wordCount <= 140) {
      clarity += 0.8;
      structure += 0.8;
      strengths.push("Provided a well-detailed explanation with clear narrative flow.");
    } else if (wordCount > 180) {
      conciseness -= 1.5;
      weaknesses.push("Answer was slightly long-winded; practice staying focused on essential trade-offs.");
    }

    const starMatches = [
      "situation", "task", "action", "result", "implemented", "impact",
      "reduced", "increased", "because", "trade-off", "metric", "tested", "designed", "built"
    ].filter((k) => lowerAns.includes(k)).length;

    if (starMatches >= 3) {
      structure += 1.8;
      correctness += 0.8;
      strengths.push("Effectively applied STAR framing to emphasize individual actions and quantifiable impact.");
    } else if (starMatches >= 1) {
      structure += 0.8;
    } else {
      weaknesses.push("Consider structuring responses explicitly with the STAR framework (Situation, Task, Action, Result).");
    }

    if (/\b\d+(\.\d+)?(%|ms|s|x|k|mb|gb|users|requests)\b/i.test(ans) || lowerAns.includes("percent")) {
      correctness += 0.8;
      clarity += 0.5;
      strengths.push("Strongly quantified technical outcomes with concrete benchmark figures.");
    }
  }

  correctness = Math.min(Math.max(correctness, 1.0), 9.8);
  relevance = Math.min(Math.max(relevance, 1.0), 9.8);
  clarity = Math.min(Math.max(clarity, 1.0), 9.5);
  structure = Math.min(Math.max(structure, 1.0), 9.5);
  conciseness = Math.min(Math.max(conciseness, 1.0), 9.5);

  const overallScore = Number(
    (correctness * 0.35 + relevance * 0.25 + clarity * 0.15 + structure * 0.15 + conciseness * 0.10).toFixed(1)
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
        ? "Confident delivery with concrete professional references."
        : overallScore <= 4.0
        ? "Hesitant or incomplete delivery lacking core depth."
        : "Moderate confidence; could elaborate more firmly on decision trade-offs.",
    strengths: strengths.length > 0 ? strengths : ["Attempted the technical scenario under interview conditions."],
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
    if (overallScore >= 7.8) activeDifficulty = "Hard";
    else if (overallScore <= 5.0) activeDifficulty = "Easy";
    else activeDifficulty = "Medium";
  }

  // Generate progressive next question from the 5-stage real company question matrix
  const nextQNum = questionNumber + 1;
  const generatedQ = adaptiveEngine.generateFollowUpQuestion(
    config,
    nextQNum,
    currentQuestion.text,
    candidateAnswer,
    profile
  );

  return {
    evaluation,
    isComplete: false,
    nextQuestion: {
      text: generatedQ.text,
      questionType: (generatedQ.category?.toLowerCase().includes("star") || generatedQ.category?.toLowerCase().includes("collaboration") ? "behavioral" : "technical") as QuestionType,
      difficulty: activeDifficulty,
      category: generatedQ.category || "Applied Problem Solving",
      isFollowUp: !!generatedQ.isFollowUp,
      followUpQuestionRelationship: generatedQ.isFollowUp ? `Follows Q${questionNumber}` : undefined,
      yesNoOptions: false,
    },
  };
}
