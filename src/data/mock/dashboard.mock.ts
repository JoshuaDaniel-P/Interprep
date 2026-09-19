import { UserProfile, UserDashboardMetrics } from "@/types/user";
import { SkillBreakdownScores } from "@/types/evaluation";

export const mockUserProfile: UserProfile = {
  id: "user-123",
  name: "Alex",
  email: "alex@example.com",
  targetRole: "Software Engineer",
  joinedDate: "September 2026",
};

export const mockDashboardMetrics: UserDashboardMetrics = {
  interviewsCompleted: 14,
  averageScore: 7.4,
  practiceStreakDays: 5,
  improvementPercentage: 21,
  scoreTrend: [
    { date: "Sep 1", score: 5.8 },
    { date: "Sep 5", score: 6.1 },
    { date: "Sep 9", score: 6.4 },
    { date: "Sep 14", score: 6.8 },
    { date: "Sep 17", score: 7.1 },
    { date: "Sep 19", score: 7.4 },
  ],
  topRecommendation:
    "Your structure score is improving, but your answers could be more concise. Try keeping your next behavioral answer under 90 seconds and use a clear STAR structure.",
};

export const mockSkillBreakdown: SkillBreakdownScores = {
  content: { score: 8.0, feedback: "Strong technical depth and relevant examples." },
  structure: { score: 6.8, feedback: "Good narrative, but missed key metrics in final results." },
  relevance: { score: 8.5, feedback: "Directly addressed all key questions." },
  clarity: { score: 7.4, feedback: "Clear articulation with clear technical terminology." },
  confidence: { score: 7.2, feedback: "Steady tone, minimal filler words." },
  conciseness: { score: 6.4, feedback: "Tended to over-explain initial setup steps." },
};
