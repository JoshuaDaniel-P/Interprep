import { z } from "zod";

// Base primitives
export const questionTypeEnum = z.enum(["technical", "behavioral", "system_design", "yes_no", "mixed"]).or(z.string());
export const difficultyEnum = z.enum(["Adaptive", "Realistic", "Hard", "Standard", "Challenging"]).or(z.string());

export const interviewConfigSchema = z.object({
  targetRole: z.string().min(1, "targetRole is required").max(100),
  companyType: z.string().max(100).default("Product Company"),
  company: z.string().max(100).optional(),
  experienceLevel: z.string().max(100).default("0–2 years"),
  interviewType: z.string().max(100).default("Mixed"),
  mode: z.string().max(50).default("Text"),
  difficulty: difficultyEnum.default("Realistic"),
  questionCount: z.number().int().min(1).max(20).optional(),
  targetQuestionsCount: z.number().int().min(1).max(20).optional(),
  courseTrack: z.string().max(100).optional(),
  moduleTopic: z.string().max(200).optional(),
  practicePrompt: z.string().max(1000).optional(),
  keyTopics: z.array(z.string().max(100)).optional(),
});

export const recordedQuestionSchema = z.object({
  questionId: z.string().max(100).optional(),
  questionText: z.string().min(1).max(2000),
  questionType: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
  difficulty: z.string().max(50).optional(),
  candidateAnswer: z.string().max(15000).default(""),
  answerDuration: z.number().nonnegative().optional(),
  questionNumber: z.number().int().positive().optional(),
  evaluation: z.any().optional(),
  categoryScores: z.record(z.string(), z.number()).optional(),
  weaknesses: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  modelIdealAnswer: z.string().optional(),
  improvementTip: z.string().optional(),
});

export const evaluateAndNextRequestSchema = z.object({
  config: interviewConfigSchema,
  candidateProfile: z.record(z.string(), z.any()).nullable().optional(),
  previousQuestions: z.array(recordedQuestionSchema).default([]),
  currentQuestion: z.object({
    id: z.string().max(100).default("q-current"),
    text: z.string().min(1, "Question text cannot be empty").max(2000),
    questionType: z.string().max(50).optional(),
    difficulty: z.string().max(50).optional(),
    isFollowUp: z.boolean().optional(),
    questionNumber: z.number().int().positive().default(1),
    yesNoOptions: z.boolean().optional(),
  }),
  candidateAnswer: z.string().min(1, "Answer cannot be empty").max(15000, "Answer exceeds maximum length"),
  answerDuration: z.number().nonnegative().default(45),
  questionNumber: z.number().int().positive().default(1),
  targetTotal: z.number().int().positive().default(5),
});

export const finalEvaluationRequestSchema = z.object({
  config: interviewConfigSchema,
  candidateProfile: z.record(z.string(), z.any()).nullable().optional(),
  recordedQuestions: z.array(recordedQuestionSchema).min(1, "At least one recorded question is required for final evaluation"),
  durationSeconds: z.number().nonnegative().default(600),
  userId: z.string().max(100).default("candidate-active"),
});

export const createCandidateRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address format").max(200),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  targetRole: z.string().max(100).optional(),
  adminEmail: z.string().email("Valid administrator email required").max(200),
});

export const verifyRoleRequestSchema = z.object({
  email: z.string().email().max(200).optional().nullable(),
  uid: z.string().max(128).optional().nullable(),
});

export type EvaluateAndNextRequest = z.infer<typeof evaluateAndNextRequestSchema>;
export type FinalEvaluationRequest = z.infer<typeof finalEvaluationRequestSchema>;
export type CreateCandidateRequest = z.infer<typeof createCandidateRequestSchema>;
export type VerifyRoleRequest = z.infer<typeof verifyRoleRequestSchema>;
