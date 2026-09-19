import { CategoryScores, RecordedQuestion } from "./interview";

export interface MetricScore {
  score: number; // 0 to 10 scale
  feedback: string;
}

export interface SkillBreakdownScores {
  content: MetricScore;
  structure: MetricScore;
  relevance: MetricScore;
  clarity: MetricScore;
  confidence: MetricScore;
  conciseness: MetricScore;
}

export interface Evaluation {
  sessionId: string;
  overallScore: number;
  skills: SkillBreakdownScores;
  categoryScores?: CategoryScores;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  recurringIssues?: string[];
  missingKnowledge?: string[];
  answerStructureIssues?: string[];
  communicationIssues?: string[];
  technicalGaps?: string[];
  recommendedPreparationAreas?: string[];
  questions?: RecordedQuestion[];
  evaluatedAt: string;
}
