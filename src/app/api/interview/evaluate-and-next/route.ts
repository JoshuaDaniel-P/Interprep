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
  const wordCount = ans.split(/\s+/).filter(Boolean).length;
  const lowerAns = ans.toLowerCase();

  const isYesNo = currentQuestion.questionType === "yes_no" || /^(yes|no|yeah|nope|sure|never)[\s.,!]*$/i.test(ans);
  const isAffirmative = /^(yes|yeah|sure|definitely|i have|absolutely)/i.test(lowerAns);

  // Dynamic STAR scoring
  let correctness = 7.0;
  let relevance = 7.2;
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
    strengths.push("Direct, decisive response to the screening scenario.");
  } else {
    if (wordCount >= 35) {
      clarity += 0.6;
      structure += 0.6;
      strengths.push("Provided a well-detailed explanation with practical context.");
    } else if (wordCount < 15) {
      clarity -= 1.5;
      structure -= 1.5;
      weaknesses.push("Response was too brief; missed explaining specific steps and outcomes.");
      missingInfo.push("Concrete actions taken and quantifiable impact.");
    }

    // STAR keyword indicators
    if (lowerAns.includes("situation") || lowerAns.includes("problem") || lowerAns.includes("task") || lowerAns.includes("goal")) {
      structure += 0.5;
      strengths.push("Established the background situation and task effectively.");
    }
    if (lowerAns.includes("i did") || lowerAns.includes("i built") || lowerAns.includes("i implemented") || lowerAns.includes("i designed") || lowerAns.includes("action")) {
      correctness += 0.5;
      strengths.push("Clearly articulated individual ownership and technical actions.");
    }
    if (lowerAns.includes("result") || lowerAns.includes("reduced") || lowerAns.includes("increased") || lowerAns.includes("percent") || lowerAns.includes("ms") || lowerAns.includes("%")) {
      correctness += 0.7;
      relevance += 0.5;
      strengths.push("Strongly quantified the outcome with concrete metrics.");
    }

    // Probing domain keywords
    if (lowerAns.includes("cache") || lowerAns.includes("redis") || lowerAns.includes("database") || lowerAns.includes("api")) {
      correctness += 0.6;
      strengths.push("Demonstrated practical understanding of system architecture and performance.");
    }
    if (lowerAns.includes("react") || lowerAns.includes("component") || lowerAns.includes("state") || lowerAns.includes("css")) {
      correctness += 0.6;
      strengths.push("Showed familiarity with client-side architecture and rendering mechanics.");
    }

    if (wordCount > 130) {
      conciseness -= 1.2;
      weaknesses.push("Slightly long-winded; aim to keep responses focused under 90 seconds.");
    }
  }

  correctness = Math.min(Math.max(correctness, 3.5), 9.6);
  relevance = Math.min(Math.max(relevance, 4.0), 9.8);
  clarity = Math.min(Math.max(clarity, 3.5), 9.5);
  structure = Math.min(Math.max(structure, 3.5), 9.5);
  conciseness = Math.min(Math.max(conciseness, 3.5), 9.5);

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
        ? "Confident delivery with concrete professional references."
        : "Moderate confidence; could elaborate more firmly on decision trade-offs.",
    strengths: strengths.length > 0 ? strengths : ["Demonstrated foundational awareness of the subject."],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Consider structuring answers explicitly with the STAR method."],
    missingInformation: missingInfo.length > 0 ? missingInfo : ["Deeper elaboration on alternatives considered."],
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
    else if (overallScore <= 5.5) activeDifficulty = "Easy";
    else activeDifficulty = "Medium";
  }

  const candidateName = profile?.fullName?.trim() || "Candidate";
  const companyName = config.company?.trim() || config.companyType || "our engineering team";
  const primaryProject = profile?.projects?.[0];

  // -------------------------------------------------------------------------
  // Contextual Follow-up if current question was Yes/No
  // -------------------------------------------------------------------------
  if (isYesNo) {
    if (isAffirmative) {
      return {
        evaluation,
        isComplete: false,
        nextQuestion: {
          text: `Great. Could you describe a specific instance where you applied that workflow? What hurdles arose and how did your contribution resolve them?`,
          questionType: "situational",
          difficulty: activeDifficulty,
          category: "Adaptive Probing",
          isFollowUp: true,
          followUpQuestionRelationship: `Follow-up to affirmative answer on Q${questionNumber}`,
          yesNoOptions: false,
        },
      };
    } else {
      return {
        evaluation,
        isComplete: false,
        nextQuestion: {
          text: `Understood. When encountering an unfamiliar system or process on our team at ${companyName}, what is your standard approach for getting up to speed rapidly?`,
          questionType: "behavioral",
          difficulty: activeDifficulty,
          category: "Adaptability & Learning",
          isFollowUp: true,
          followUpQuestionRelationship: `Alternative follow-up to negative answer on Q${questionNumber}`,
          yesNoOptions: false,
        },
      };
    }
  }

  // -------------------------------------------------------------------------
  // Contextual Follow-up if Candidate Answer was too brief
  // -------------------------------------------------------------------------
  if (wordCount < 18) {
    return {
      evaluation,
      isComplete: false,
      nextQuestion: {
        text: `You mentioned a key point, but could you elaborate specifically on your individual action? In an interview for ${config.targetRole}, what exact steps did you take and what was the quantifiable result?`,
        questionType: "candidate_specific",
        difficulty: activeDifficulty,
        category: "STAR Elaboration",
        isFollowUp: true,
        followUpQuestionRelationship: `Probing depth on Q${questionNumber}`,
        yesNoOptions: false,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Question Progression Tailored to Target Role & Candidate Info
  // -------------------------------------------------------------------------
  const nextQNum = questionNumber + 1;

  // If candidate has a declared project, Q2 & Q3 drill directly into it
  if (nextQNum === 2 && primaryProject?.name) {
    const tech = primaryProject.technologies?.slice(0, 2).join(" and ") || "your tech stack";
    return {
      evaluation,
      isComplete: false,
      nextQuestion: {
        text: `In your project "${primaryProject.name}", how did you design the architecture between your components (such as ${tech}) and what trade-offs did you make?`,
        questionType: "project",
        difficulty: activeDifficulty,
        category: "Candidate Project Deep Dive",
        isFollowUp: false,
        yesNoOptions: false,
      },
    };
  }

  if (nextQNum === 3 && primaryProject?.name) {
    const challenge = primaryProject.challenges || "a major bottleneck";
    return {
      evaluation,
      isComplete: false,
      nextQuestion: {
        text: `When addressing "${challenge}" in "${primaryProject.name}", what analytical metrics did you benchmark before and after, and what alternatives did you reject?`,
        questionType: "candidate_specific",
        difficulty: activeDifficulty,
        category: "Bottleneck Analysis",
        isFollowUp: true,
        followUpQuestionRelationship: `Direct follow-up to project architecture`,
        yesNoOptions: false,
      },
    };
  }

  // Dynamic role-specific question banks for Q4+
  const roleQuestionBank: Record<
    string,
    Array<{
      text: string;
      questionType: QuestionType;
      category: string;
      isFollowUp: boolean;
      yesNoOptions?: boolean;
    }>
  > = {
    "Frontend Developer": [
      {
        text: "Have you worked with modern component performance profiling tools (like React Profiler or Lighthouse) in production?",
        questionType: "yes_no",
        category: "Profiling & Diagnostics",
        isFollowUp: false,
        yesNoOptions: true,
      },
      {
        text: `For a Frontend role at ${companyName}, how would you design a global notification or modal system that is accessible (WCAG keyboard focus trap) and decouple state from presentation?`,
        questionType: "technical",
        category: "Component Architecture",
        isFollowUp: false,
      },
      {
        text: "How do you handle responsive caching and data revalidation between client components and server rendering?",
        questionType: "problem_solving",
        category: "Client-Server Boundaries",
        isFollowUp: false,
      },
      {
        text: `Why do you want to build frontend systems for ${companyName} specifically, and how do you stay current with evolving browser standards?`,
        questionType: "company_oriented",
        category: "Company & Culture Fit",
        isFollowUp: false,
      },
    ],
    "Backend Developer": [
      {
        text: "Have you ever designed and maintained idempotent endpoints for financial transactions or state transitions?",
        questionType: "yes_no",
        category: "API Design",
        isFollowUp: false,
        yesNoOptions: true,
      },
      {
        text: `At ${companyName}, services need to withstand traffic spikes without cascading failures. How would you implement rate limiting, circuit breakers, and database connection pooling?`,
        questionType: "technical",
        category: "System Resilience",
        isFollowUp: false,
      },
      {
        text: "Between normalized relational schemas and document/cache-based stores, what criteria determine where transactional data should live?",
        questionType: "problem_solving",
        category: "Database Architecture",
        isFollowUp: false,
      },
      {
        text: `Tell me about a time you handled an unexpected production incident or slow database query. What was your triage protocol?`,
        questionType: "situational",
        category: "Production Operations",
        isFollowUp: false,
      },
    ],
    "Data Scientist": [
      {
        text: "Have you ever deployed a machine learning model into a production API or streaming inference pipeline?",
        questionType: "yes_no",
        category: "MLOps & Deployment",
        isFollowUp: false,
        yesNoOptions: true,
      },
      {
        text: `When evaluating classification performance on highly imbalanced user data at ${companyName}, when would you prioritize Precision over Recall, and how would you tune your decision threshold?`,
        questionType: "technical",
        category: "Model Evaluation",
        isFollowUp: false,
      },
      {
        text: "How do you systematically detect and remediate data leakage during feature engineering on historical time-series datasets?",
        questionType: "problem_solving",
        category: "Feature Engineering",
        isFollowUp: false,
      },
      {
        text: `How do you present complex mathematical or statistical model predictions to non-technical business stakeholders?`,
        questionType: "behavioral",
        category: "Stakeholder Communication",
        isFollowUp: false,
      },
    ],
    "Data Analyst": [
      {
        text: "Have you ever automated an end-to-end SQL pipeline with automated data quality assertions?",
        questionType: "yes_no",
        category: "Data Quality",
        isFollowUp: false,
        yesNoOptions: true,
      },
      {
        text: `If leadership at ${companyName} notices user retention dropped 8% week-over-week, walk me through your diagnostic query plan to identify the contributing cohort.`,
        questionType: "problem_solving",
        category: "Cohort Analysis",
        isFollowUp: false,
      },
      {
        text: "How do you design database views or dimensional schemas (star/snowflake) to optimize dashboard load times?",
        questionType: "technical",
        category: "Data Modeling",
        isFollowUp: false,
      },
    ],
    "UI Designer": [
      {
        text: "Have you conducted live moderated user usability testing sessions on interactive prototypes?",
        questionType: "yes_no",
        category: "User Research",
        isFollowUp: false,
        yesNoOptions: true,
      },
      {
        text: `How do you maintain design tokens and reusable component libraries in Figma so frontend engineers at ${companyName} can implement them with zero guesswork?`,
        questionType: "technical",
        category: "Design Systems",
        isFollowUp: false,
      },
      {
        text: "Walk me through a design disagreement where user testing data contradicted an executive's preference. How did you resolve it?",
        questionType: "behavioral",
        category: "Design Advocacy",
        isFollowUp: false,
      },
    ],
    "Product Manager": [
      {
        text: "Have you ever defined North Star metrics and managed sprint trade-offs directly with engineering leads?",
        questionType: "yes_no",
        category: "Product Execution",
        isFollowUp: false,
        yesNoOptions: true,
      },
      {
        text: `If engineering at ${companyName} reports an unexpected technical delay on a launch commitment, how do you adjust scope and communicate with leadership?`,
        questionType: "situational",
        category: "Roadmap Management",
        isFollowUp: false,
      },
      {
        text: "How do you distinguish between what users say they want versus what they actually need during discovery interviews?",
        questionType: "behavioral",
        category: "Customer Discovery",
        isFollowUp: false,
      },
    ],
    "College Lecturer": [
      {
        text: "Have you designed original laboratory assignments or coding rubrics for introductory technical courses?",
        questionType: "yes_no",
        category: "Pedagogy",
        isFollowUp: false,
        yesNoOptions: true,
      },
      {
        text: "How do you explain abstract programming concepts (like recursion or memory pointers) to beginners who are struggling?",
        questionType: "technical",
        category: "Instructional Clarity",
        isFollowUp: false,
      },
    ],
  };

  const pool = roleQuestionBank[config.targetRole] || roleQuestionBank["Software Developer"] || [
    {
      text: "Have you ever collaborated in a multi-developer environment using feature branches and peer pull requests?",
      questionType: "yes_no" as QuestionType,
      category: "Workflow & Collaboration",
      isFollowUp: false,
      yesNoOptions: true,
    },
    {
      text: `For a ${config.targetRole} role at ${companyName}, how would you ensure that your code remains testable and scalable under tight release deadlines?`,
      questionType: "technical" as QuestionType,
      category: "Engineering Quality",
      isFollowUp: false,
    },
    {
      text: `Can you walk me through an example of a technical disagreement during an architectural discussion, and how you reached alignment?`,
      questionType: "behavioral" as QuestionType,
      category: "Conflict Resolution",
      isFollowUp: false,
    },
    {
      text: `Why are you interested in joining ${companyName} specifically, and how do your background and career goals align with our team's mission?`,
      questionType: "company_oriented" as QuestionType,
      category: "Company Alignment",
      isFollowUp: false,
    },
  ];

  const questionIdx = (nextQNum - 2) % pool.length;
  const chosenQuestion = pool[questionIdx];

  return {
    evaluation,
    isComplete: false,
    nextQuestion: {
      ...chosenQuestion,
      difficulty: activeDifficulty,
    },
  };
}
