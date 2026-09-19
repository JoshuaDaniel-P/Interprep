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
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  evaluatedAt: string;
}
