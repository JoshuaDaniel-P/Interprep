import {
  InterviewConfig,
  InterviewQuestion,
  InterviewAnswer,
  RecordedQuestion,
  QuestionEvaluation,
  CategoryScores,
} from "@/types/interview";
import { Evaluation } from "@/types/evaluation";

export class EvaluationService {
  evaluateSession(
    config: InterviewConfig,
    questions: InterviewQuestion[],
    answers: InterviewAnswer[],
    recordedQuestions?: RecordedQuestion[]
  ): Evaluation {
    // Collect all answers
    const totalWords = answers.reduce((acc, a) => acc + (a.text ? a.text.trim().split(/\s+/).filter(Boolean).length : 0), 0);
    const count = Math.max(answers.length, 1);
    const avgWordsPerAnswer = Math.round(totalWords / count);

    let totalContentScore = 0;
    let totalStructureScore = 0;
    let totalRelevanceScore = 0;
    let totalClarityScore = 0;
    let totalConfidenceScore = 0;
    let totalConcisenessScore = 0;

    const starKeywords = [
      "situation", "task", "action", "result", "when", "responsible", "implemented",
      "impact", "reduced", "increased", "built", "designed", "led", "resolved",
      "metric", "percent", "trade-off", "outcome", "because"
    ];
    const dismissivePhrases = [
      "don't know", "dont know", "no idea", "idk", "not sure", "nothing",
      "pass", "skip", "i have no clue", "dunno", "can't answer"
    ];

    // If we have detailed evaluations from evaluate-and-next route, use their actual scores
    const hasRecordedEvals = recordedQuestions && recordedQuestions.length > 0 && recordedQuestions.some((q) => q.evaluation?.score);

    answers.forEach((ans, idx) => {
      const text = (ans.text || "").trim();
      const textLower = text.toLowerCase();
      const words = textLower.split(/\s+/).filter(Boolean);
      const wordCount = words.length;

      // Check if user gave an empty, dismissive, or trivial answer
      const isDismissive = dismissivePhrases.some((phrase) => textLower.includes(phrase));
      const isTrivial = wordCount < 6;

      let content = 5.0;
      let structure = 5.0;
      let relevance = 5.0;
      let clarity = 5.0;
      let confidence = 5.0;
      let conciseness = 6.0;

      if (isDismissive || wordCount === 0) {
        content = 1.0;
        structure = 1.0;
        relevance = 1.5;
        clarity = 2.0;
        confidence = 1.0;
        conciseness = 3.0;
      } else if (isTrivial) {
        content = 2.5;
        structure = 2.5;
        relevance = 3.5;
        clarity = 3.5;
        confidence = 2.5;
        conciseness = 5.0;
      } else if (wordCount < 18) {
        // Very brief answer
        content = 4.0;
        structure = 3.5;
        relevance = 5.0;
        clarity = 4.5;
        confidence = 4.0;
        conciseness = 6.5;

        // Check if there are domain keywords
        if (textLower.includes("api") || textLower.includes("sql") || textLower.includes("react") || textLower.includes("component") || textLower.includes("data") || textLower.includes("user")) {
          content += 1.0;
          relevance += 1.0;
        }
      } else {
        // Detailed answer: assess depth, relevance, STAR, clarity
        content = 6.5;
        structure = 6.0;
        relevance = 6.5;
        clarity = 6.5;
        confidence = 6.5;
        conciseness = 7.0;

        // Word count bonuses
        if (wordCount >= 30 && wordCount <= 140) {
          content += 1.0;
          clarity += 0.8;
          conciseness += 1.0;
        } else if (wordCount > 180) {
          conciseness -= 1.5; // rambling
        }

        // STAR keyword detection
        const matchedStar = starKeywords.filter((k) => textLower.includes(k)).length;
        if (matchedStar >= 4) {
          structure += 2.5;
          content += 1.0;
        } else if (matchedStar >= 2) {
          structure += 1.5;
          content += 0.5;
        } else {
          structure -= 1.0;
        }

        // Relevance check against the question text
        const qText = (questions[idx]?.text || "").toLowerCase();
        const qWords = qText.split(/\s+/).filter((w) => w.length > 4);
        const matchesQ = qWords.filter((w) => textLower.includes(w)).length;
        if (matchesQ >= 2) {
          relevance += 1.8;
        } else if (matchesQ === 1) {
          relevance += 0.8;
        } else {
          relevance -= 1.0; // potential off-topic
        }

        // Ownership and Confidence
        if (textLower.includes("i implemented") || textLower.includes("i designed") || textLower.includes("i decided") || textLower.includes("my role was") || textLower.includes("i built")) {
          confidence += 1.8;
        } else if (textLower.includes("we just") || textLower.includes("someone else") || textLower.includes("maybe")) {
          confidence -= 0.8;
        }

        // Quantified Metrics
        if (/\b\d+(\.\d+)?(%|ms|s|x|k|mb|gb|users|requests)\b/i.test(text) || textLower.includes("percent") || textLower.includes("latency")) {
          content += 1.0;
          clarity += 0.5;
        }
      }

      // Bound between 1.0 and 9.8
      content = Math.min(Math.max(content, 1.0), 9.8);
      structure = Math.min(Math.max(structure, 1.0), 9.6);
      relevance = Math.min(Math.max(relevance, 1.0), 9.8);
      clarity = Math.min(Math.max(clarity, 1.0), 9.5);
      confidence = Math.min(Math.max(confidence, 1.0), 9.5);
      conciseness = Math.min(Math.max(conciseness, 1.0), 9.5);

      totalContentScore += content;
      totalStructureScore += structure;
      totalRelevanceScore += relevance;
      totalClarityScore += clarity;
      totalConfidenceScore += confidence;
      totalConcisenessScore += conciseness;
    });

    const contentAvg = Number((totalContentScore / count).toFixed(1));
    const structureAvg = Number((totalStructureScore / count).toFixed(1));
    const relevanceAvg = Number((totalRelevanceScore / count).toFixed(1));
    const clarityAvg = Number((totalClarityScore / count).toFixed(1));
    const confidenceAvg = Number((totalConfidenceScore / count).toFixed(1));
    const concisenessAvg = Number((totalConcisenessScore / count).toFixed(1));

    let overallScore: number;

    if (hasRecordedEvals) {
      // Calculate true average from recorded questions
      const evals = recordedQuestions!.map((q) => q.evaluation?.score || 5.0);
      const sum = evals.reduce((a, b) => a + b, 0);
      overallScore = Number((sum / evals.length).toFixed(1));
    } else {
      overallScore = Number(
        (
          contentAvg * 0.30 +
          structureAvg * 0.25 +
          relevanceAvg * 0.20 +
          clarityAvg * 0.10 +
          confidenceAvg * 0.08 +
          concisenessAvg * 0.07
        ).toFixed(1)
      );
    }

    // Realistic Category Scores (0-100% scale) based on actual candidate performance
    const basePct = Math.round(overallScore * 10);
    const categoryScores: CategoryScores = {
      technicalKnowledge: Math.min(Math.max(Math.round(contentAvg * 10 + (relevanceAvg >= 7 ? 3 : -5)), 15), 98),
      problemSolving: Math.min(Math.max(Math.round(structureAvg * 10 + (contentAvg >= 7 ? 2 : -4)), 15), 96),
      projects: Math.min(Math.max(Math.round(confidenceAvg * 10 + (contentAvg >= 7 ? 4 : -6)), 15), 95),
      communication: Math.min(Math.max(Math.round(clarityAvg * 10 + (concisenessAvg >= 7 ? 2 : -3)), 15), 98),
      behavioral: Math.min(Math.max(Math.round(structureAvg * 10 + (confidenceAvg >= 7 ? 3 : -5)), 15), 95),
      roleKnowledge: Math.min(Math.max(Math.round(relevanceAvg * 10), 15), 98),
      companyAwareness: Math.min(Math.max(Math.round(basePct * 0.95), 15), 95),
    };

    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];
    const recurringIssues: string[] = [];
    const technicalGaps: string[] = [];

    // Honest feedback generation
    if (avgWordsPerAnswer < 20) {
      recurringIssues.push("Responses were significantly below standard interview length (average < 20 words).");
      improvements.push("Avoid one-sentence answers; real interviewers need to hear your step-by-step reasoning.");
      recommendations.push("Practice expanding each answer with: 1) What the problem was, 2) Why you chose that solution, 3) What the outcome was.");
    }

    if (structureAvg < 6.0) {
      recurringIssues.push("Answers lacked structured narrative flow (Situation, Task, Action, Result).");
      improvements.push("Structure behavioral and project answers explicitly around the STAR framework.");
      recommendations.push("Frame your response by stating the context first, your individual contribution, and the measurable impact.");
    } else {
      strengths.push("Good application of structured explanation to present your background.");
    }

    if (contentAvg >= 7.5) {
      strengths.push(`Demonstrated solid domain understanding appropriate for a ${config.targetRole} role.`);
    } else if (contentAvg < 5.5) {
      technicalGaps.push(`Superficial depth on core ${config.targetRole} technical concepts and system trade-offs.`);
      improvements.push("Drill deeper into the architectural trade-offs, algorithms, and libraries you use.");
      recommendations.push("Prepare concrete technical case studies from your coursework or past projects.");
    }

    if (relevanceAvg >= 7.5) {
      strengths.push("Answers remained tightly focused on the core technical question asked.");
    } else {
      improvements.push("Ensure your answer directly addresses the specific scenario rather than generic descriptions.");
    }

    if (confidenceAvg >= 7.5) {
      strengths.push("Strong ownership language emphasizing personal technical leadership.");
    } else {
      improvements.push("Highlight what YOU personally decided and built, rather than passive team summaries.");
    }

    if (strengths.length === 0) {
      strengths.push("Completed the interview session under simulated test conditions.");
    }

    if (recommendations.length === 0) {
      recommendations.push("Practice under timed pressure to refine response pace and verbal conciseness.");
      recommendations.push("Incorporate quantitative metrics (e.g., latency, error rates, percentage improvements) into every technical story.");
    }

    return {
      sessionId: `session-${Date.now()}`,
      overallScore,
      categoryScores,
      skills: {
        content: {
          score: contentAvg,
          feedback:
            contentAvg >= 7.5
              ? `Solid technical reasoning aligned with ${config.targetRole} expectations.`
              : contentAvg < 5.0
              ? "Answers were thin on technical substance and lacked explanation of underlying mechanisms."
              : "Expand upon the technical implementation details and trade-offs made.",
        },
        structure: {
          score: structureAvg,
          feedback:
            structureAvg >= 7.5
              ? "Answers followed a clear narrative arc from problem statement to solution."
              : "Frame responses explicitly using Situation, Task, Action, and Quantifiable Result.",
        },
        relevance: {
          score: relevanceAvg,
          feedback:
            relevanceAvg >= 7.5
              ? `Directly addressed the interviewer's prompt for ${config.company || config.companyType} requirements.`
              : "Ensure your answer directly answers the exact scenario asked without drifting off-topic.",
        },
        clarity: {
          score: clarityAvg,
          feedback:
            clarityAvg >= 7.5
              ? "Clear, articulate explanation of technical topics."
              : "Organize longer answers into concise, distinct points for easier comprehension.",
        },
        confidence: {
          score: confidenceAvg,
          feedback:
            confidenceAvg >= 7.5
              ? "Demonstrated decisive technical ownership and clear conviction."
              : "Use active ownership language ('I designed', 'I resolved') rather than passive phrasing.",
        },
        conciseness: {
          score: concisenessAvg,
          feedback:
            concisenessAvg >= 7.5
              ? `Optimal pacing averaging ${avgWordsPerAnswer} words per response.`
              : avgWordsPerAnswer < 20
              ? "Answer was too brief to evaluate full competency."
              : "Tighten answers to focus strictly on essential technical decisions.",
        },
      },
      strengths,
      improvements,
      recommendations,
      recurringIssues,
      technicalGaps,
      questions: recordedQuestions || [],
      evaluatedAt: new Date().toISOString(),
    };
  }

  evaluateSingleAnswer(
    question: InterviewQuestion,
    answerText: string,
    config: InterviewConfig
  ): QuestionEvaluation {
    const text = (answerText || "").trim();
    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const dismissivePhrases = [
      "don't know", "dont know", "no idea", "idk", "not sure", "nothing",
      "pass", "skip", "i have no clue", "dunno", "can't answer"
    ];
    const isDismissive = dismissivePhrases.some((phrase) => textLower.includes(phrase));
    const isTrivial = wordCount < 6;

    let correctness = 5.0;
    let relevance = 5.0;
    let clarity = 5.0;
    let structure = 5.0;
    let conciseness = 6.0;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingInfo: string[] = [];

    if (isDismissive || wordCount === 0) {
      correctness = 1.0;
      relevance = 1.5;
      clarity = 2.0;
      structure = 1.0;
      conciseness = 3.0;
      weaknesses.push("Answer indicated no knowledge or was skipped.");
      missingInfo.push("Core fundamentals, definitions, and practical application.");
    } else if (isTrivial) {
      correctness = 2.5;
      relevance = 3.5;
      clarity = 3.5;
      structure = 2.0;
      conciseness = 5.0;
      weaknesses.push("Answer was too brief to demonstrate technical or domain competency.");
      missingInfo.push("Explanation of reasoning, trade-offs, and examples.");
    } else if (wordCount < 18) {
      correctness = 4.5;
      relevance = 5.0;
      clarity = 4.5;
      structure = 4.0;
      conciseness = 6.5;
      strengths.push("Provided a concise response.");
      weaknesses.push("Lacked technical depth and concrete implementation details.");
      missingInfo.push("Concrete examples, trade-offs, or measurable outcomes.");
    } else {
      correctness = 6.8;
      relevance = 7.0;
      clarity = 6.8;
      structure = 6.5;
      conciseness = 7.0;

      // Question keyword alignment
      const qWords = (question.text || "").toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const matches = qWords.filter((w) => textLower.includes(w)).length;
      if (matches >= 2) {
        relevance += 1.5;
        correctness += 0.8;
        strengths.push(`Directly addressed core topics (${qWords.slice(0, 2).join(", ")}).`);
      }

      // STAR keyword detection
      const starKeywords = [
        "situation", "task", "action", "result", "when", "responsible", "implemented",
        "impact", "reduced", "increased", "built", "designed", "led", "resolved",
        "metric", "percent", "trade-off", "outcome", "because"
      ];
      const starMatches = starKeywords.filter((k) => textLower.includes(k)).length;
      if (starMatches >= 3) {
        structure += 2.0;
        correctness += 0.8;
        strengths.push("Structured response with clear problem context and outcome.");
      }

      // Quantified metrics
      if (/\b\d+(\.\d+)?(%|ms|s|x|k|mb|gb|users|requests)\b/i.test(text) || textLower.includes("percent")) {
        correctness += 1.0;
        clarity += 0.5;
        strengths.push("Included quantifiable metrics to substantiate technical impact.");
      }

      // Ownership
      if (textLower.includes("i implemented") || textLower.includes("i designed") || textLower.includes("i built") || textLower.includes("i decided")) {
        strengths.push("Clear candidate ownership of technical decisions.");
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

    return {
      score: overallScore,
      technicalCorrectness: Number(correctness.toFixed(1)),
      relevance: Number(relevance.toFixed(1)),
      clarity: Number(clarity.toFixed(1)),
      structure: Number(structure.toFixed(1)),
      conciseness: Number(conciseness.toFixed(1)),
      confidenceIndicators:
        overallScore >= 7.5
          ? "Demonstrated confident delivery with clear domain fluency."
          : overallScore <= 4.0
          ? "Hesitant delivery with noticeable technical gaps."
          : "Competent response; would benefit from deeper trade-off discussions.",
      strengths: strengths.length > 0 ? strengths : ["Attempted the question under interview conditions."],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Consider elaborating further on specific edge cases."],
      missingInformation: missingInfo.length > 0 ? missingInfo : ["Alternative approaches considered."],
      feedback: `Score: ${overallScore}/10. ${strengths[0] || ""} ${weaknesses[0] || ""}`.trim(),
    };
  }
}

export const evaluationService = new EvaluationService();
