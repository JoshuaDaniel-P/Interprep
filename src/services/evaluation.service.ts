import { InterviewConfig, InterviewQuestion, InterviewAnswer } from "@/types/interview";
import { Evaluation } from "@/types/evaluation";

export class EvaluationService {
  evaluateSession(
    config: InterviewConfig,
    questions: InterviewQuestion[],
    answers: InterviewAnswer[]
  ): Evaluation {
    // Collect all answers
    const totalWords = answers.reduce((acc, a) => acc + (a.text ? a.text.trim().split(/\s+/).length : 0), 0);
    const avgWordsPerAnswer = answers.length > 0 ? Math.round(totalWords / answers.length) : 0;

    let totalContentScore = 0;
    let totalStructureScore = 0;
    let totalRelevanceScore = 0;
    let totalClarityScore = 0;
    let totalConfidenceScore = 0;
    let totalConcisenessScore = 0;

    const starKeywords = ["situation", "task", "action", "result", "when", "responsible", "implemented", "impact", "reduced", "increased", "built", "designed", "led", "resolved"];
    const fillerWords = ["um", "uh", "like", "sort of", "kind of", "basically", "actually", "honestly", "maybe", "i guess"];

    answers.forEach((ans, idx) => {
      const textLower = (ans.text || "").toLowerCase();
      const words = textLower.split(/\s+/).filter(Boolean);

      // 1. Content: depth, length, technical specifics
      let content = 6.5;
      if (words.length >= 60) content += 1.5;
      else if (words.length >= 30) content += 0.8;
      else if (words.length < 15) content -= 1.5;

      if (textLower.includes("data") || textLower.includes("api") || textLower.includes("test") || textLower.includes("code") || textLower.includes("user") || textLower.includes("team") || textLower.includes("design") || textLower.includes("metric")) {
        content += 1.0;
      }
      totalContentScore += Math.min(Math.max(content, 4.0), 9.8);

      // 2. Structure: STAR method presence
      let structure = 6.0;
      const foundStar = starKeywords.filter((k) => textLower.includes(k)).length;
      if (foundStar >= 4) structure += 2.8;
      else if (foundStar >= 2) structure += 1.8;
      else structure -= 0.5;
      totalStructureScore += Math.min(Math.max(structure, 4.0), 9.6);

      // 3. Relevance: matches role & question
      let relevance = 7.2;
      const qWords = (questions[idx]?.text || "").toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const matchesQ = qWords.filter((w) => textLower.includes(w)).length;
      if (matchesQ >= 2) relevance += 1.6;
      totalRelevanceScore += Math.min(Math.max(relevance, 5.0), 9.9);

      // 4. Clarity: sentence structure and coherence
      let clarity = 7.0;
      if (words.length >= 25 && words.length <= 150) clarity += 1.5;
      totalClarityScore += Math.min(Math.max(clarity, 4.5), 9.5);

      // 5. Confidence: ownership language ("I led", "I created", "we delivered")
      let confidence = 6.8;
      if (textLower.includes("i ") || textLower.includes("my ") || textLower.includes("responsible") || textLower.includes("decided")) {
        confidence += 1.6;
      }
      if (textLower.includes("not sure") || textLower.includes("i don't know") || textLower.includes("maybe")) {
        confidence -= 1.4;
      }
      totalConfidenceScore += Math.min(Math.max(confidence, 4.0), 9.5);

      // 6. Conciseness: avoid rambling or too few words
      let conciseness = 7.5;
      const fillerCount = fillerWords.filter((f) => textLower.includes(f)).length;
      if (fillerCount > 3) conciseness -= 1.5;
      if (words.length > 200) conciseness -= 1.0;
      else if (words.length >= 35 && words.length <= 120) conciseness += 1.5;
      totalConcisenessScore += Math.min(Math.max(conciseness, 4.5), 9.8);
    });

    const count = answers.length || 1;
    const contentAvg = Number((totalContentScore / count).toFixed(1));
    const structureAvg = Number((totalStructureScore / count).toFixed(1));
    const relevanceAvg = Number((totalRelevanceScore / count).toFixed(1));
    const clarityAvg = Number((totalClarityScore / count).toFixed(1));
    const confidenceAvg = Number((totalConfidenceScore / count).toFixed(1));
    const concisenessAvg = Number((totalConcisenessScore / count).toFixed(1));

    const overallScore = Number(
      (
        contentAvg * 0.25 +
        structureAvg * 0.25 +
        relevanceAvg * 0.15 +
        clarityAvg * 0.15 +
        confidenceAvg * 0.10 +
        concisenessAvg * 0.10
      ).toFixed(1)
    );

    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];

    if (structureAvg >= 7.5) {
      strengths.push("Good application of the STAR method to organize your technical experiences.");
    } else {
      improvements.push("Incorporate clear STAR components (Situation, Task, Action, and Result) in each turn.");
      recommendations.push("Explicitly state what action YOU took and quantify the final result (e.g. latency reduced by 40%).");
    }

    if (contentAvg >= 7.5) {
      strengths.push(`Strong domain depth appropriate for a ${config.targetRole} role.`);
    } else {
      improvements.push("Provide more concrete technical specifics, architectures, or metric outcomes.");
      recommendations.push("Mention specific libraries, design patterns, and benchmarks you used.");
    }

    if (confidenceAvg >= 7.5) {
      strengths.push("Demonstrated strong ownership and authoritative decision-making in your answers.");
    } else {
      improvements.push("Use more decisive ownership language instead of tentative phrases.");
    }

    if (concisenessAvg >= 7.5) {
      strengths.push("Direct, crisp delivery with minimal filler phrasing.");
    } else {
      improvements.push("Aim to tighten answer length to 45–90 seconds (approx. 70–120 words).");
    }

    if (recommendations.length === 0) {
      recommendations.push("Continue practicing under timed conditions and test with higher difficulty pressure rounds.");
      recommendations.push("Focus on explaining technical trade-offs (e.g. why one database or pattern over another).");
    }

    return {
      sessionId: `session-${Date.now()}`,
      overallScore,
      skills: {
        content: {
          score: contentAvg,
          feedback:
            contentAvg >= 7.5
              ? `Solid technical reasoning aligned with ${config.targetRole} requirements.`
              : "Expand upon the technical implementation details and trade-offs made.",
        },
        structure: {
          score: structureAvg,
          feedback:
            structureAvg >= 7.5
              ? "Answers followed a clear narrative arc from problem statement to solution."
              : "Frame responses using Situation, Task, Action, and Quantifiable Result.",
        },
        relevance: {
          score: relevanceAvg,
          feedback:
            relevanceAvg >= 7.5
              ? `Directly addressed the interviewer's prompt for ${config.companyType} expectations.`
              : "Ensure every answer stays strictly focused on the primary question asked.",
        },
        clarity: {
          score: clarityAvg,
          feedback:
            clarityAvg >= 7.5
              ? "Articulate and easily understandable explanation of complex ideas."
              : "Break longer explanations into numbered steps or distinct points.",
        },
        confidence: {
          score: confidenceAvg,
          feedback:
            confidenceAvg >= 7.5
              ? "Exuded conviction and clear accountability for project outcomes."
              : "Highlight your individual contribution with assertive statements.",
        },
        conciseness: {
          score: concisenessAvg,
          feedback:
            concisenessAvg >= 7.5
              ? `Optimal pacing averaging ${avgWordsPerAnswer} words per response.`
              : "Reduce preamble and dive straight into your key actions and results.",
        },
      },
      strengths,
      improvements,
      recommendations,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

export const evaluationService = new EvaluationService();
