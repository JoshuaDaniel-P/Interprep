export type TargetRole =
  | "Software Engineer"
  | "Frontend Developer"
  | "Backend Developer"
  | "Data Analyst"
  | "Product Manager"
  | "Marketing"
  | "Sales";

export type CompanyType =
  | "Startup"
  | "Product Company"
  | "Service Company"
  | "Consulting"
  | "Fintech"
  | "Enterprise";

export type ExperienceLevel =
  | "Student"
  | "0–2 years"
  | "2–5 years"
  | "5+ years";

export type InterviewType = "Behavioral" | "Technical" | "HR" | "Mixed";

export type InterviewMode = "Text" | "Voice";

export type Difficulty = "Comfortable" | "Realistic" | "Pressure";

export interface InterviewConfig {
  targetRole: TargetRole;
  companyType: CompanyType;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  mode: InterviewMode;
  difficulty: Difficulty;
}

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  text: string;
  category?: string;
  isFollowUp?: boolean;
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  text: string;
  submittedAt: string;
  timeSpentSeconds: number;
}

export type InterviewStatus = "setup" | "in_progress" | "completed";

export interface InterviewSession {
  id: string;
  createdAt: string;
  config: InterviewConfig;
  status: InterviewStatus;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  timeElapsedSeconds: number;
  score?: number;
}
