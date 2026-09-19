export type TargetRole =
  | "Software Engineer"
  | "Software Developer"
  | "Frontend Developer"
  | "Backend Developer"
  | "Data Analyst"
  | "Data Scientist"
  | "UI Designer"
  | "College Lecturer"
  | "Product Manager"
  | "Marketing"
  | "Sales";

export type CompanyType =
  | "Startup"
  | "Product Company"
  | "Service Company"
  | "Consulting"
  | "Fintech"
  | "Enterprise"
  | "Autonomous Engineering College"
  | "Tier-1 Research Institute (IIT/NIT/BITS)"
  | "State / Central University"
  | "Polytechnic / Community College"
  | "EdTech Academy"
  | "Design Agency / Studio"
  | "Consumer Tech"
  | "B2B SaaS"
  | string;

export type ExperienceLevel =
  | "Student"
  | "0–2 years"
  | "2–5 years"
  | "5+ years";

export type InterviewType = "Behavioral" | "Technical" | "HR" | "Mixed";

export type InterviewMode = "Text" | "Voice";

export type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard"
  | "Adaptive"
  | "Comfortable"
  | "Realistic"
  | "Pressure";

export type QuestionType =
  | "introductory"
  | "project"
  | "candidate_specific"
  | "behavioral"
  | "situational"
  | "technical"
  | "system_design"
  | "role_specific"
  | "company_oriented"
  | "problem_solving"
  | "short_answer"
  | "yes_no";

export interface InterviewConfig {
  targetRole: TargetRole;
  companyType: CompanyType;
  company?: string;
  jobDescription?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  mode: InterviewMode;
  difficulty: Difficulty;
  questionCount?: number;
  targetQuestionsCount?: number;
  moduleTopic?: string;
  courseTrack?: string;
  practicePrompt?: string;
  keyTopics?: string[];
}

export interface QuestionEvaluation {
  score: number; // 0 to 10 scale
  technicalCorrectness: number; // 0 to 10
  relevance: number; // 0 to 10
  clarity: number; // 0 to 10
  structure: number; // 0 to 10
  conciseness: number; // 0 to 10
  confidenceIndicators?: string;
  strengths: string[];
  weaknesses: string[];
  missingInformation: string[];
  feedback?: string;
}

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  text: string;
  category?: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  isFollowUp?: boolean;
  followUpQuestionRelationship?: string;
  yesNoOptions?: boolean;
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  text: string;
  submittedAt: string;
  timeSpentSeconds: number;
}

export interface RecordedQuestion {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  question: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  candidateAnswer: string;
  timestamp: string;
  answerDuration: number;
  evaluation: QuestionEvaluation;
  isFollowUp: boolean;
  followUpQuestionRelationship?: string;
}

export interface CategoryScores {
  technicalKnowledge: number;
  problemSolving: number;
  projects: number;
  communication: number;
  behavioral: number;
  roleKnowledge: number;
  companyAwareness: number;
}

export interface StoredInterviewRecord {
  id: string;
  userId: string;
  role: string;
  companyType: string;
  company: string;
  difficulty: Difficulty;
  startedAt: string;
  completedAt: string;
  duration: number; // in seconds
  questionCount: number;
  overallScore: number;
  categoryScores: CategoryScores;
  questions: RecordedQuestion[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recurringIssues: string[];
  missingKnowledge: string[];
  answerStructureIssues: string[];
  communicationIssues: string[];
  technicalGaps: string[];
  preparationGaps: string[];
  recommendedPreparationAreas: string[];
}

export type InterviewStatus = "setup" | "in_progress" | "completed";

export interface InterviewSession {
  id: string;
  userId?: string;
  createdAt: string;
  completedAt?: string;
  config: InterviewConfig;
  status: InterviewStatus;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  recordedQuestions?: RecordedQuestion[];
  currentQuestionIndex: number;
  timeElapsedSeconds: number;
  score?: number;
  evaluation?: any;
  categoryScores?: CategoryScores;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  recommendedPreparationAreas?: string[];
}
