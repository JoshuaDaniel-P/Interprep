import { UserDashboardMetrics, UserProfile } from "@/types/user";
import { SkillBreakdownScores } from "@/types/evaluation";
import { mockUserProfile } from "@/data/mock/dashboard.mock";

export const zeroDashboardMetrics: UserDashboardMetrics = {
  interviewsCompleted: 0,
  averageScore: 0.0,
  practiceStreakDays: 0,
  improvementPercentage: 0,
  scoreTrend: [],
  topRecommendation: "Complete your first mock interview simulation to unlock tailored diagnostic feedback.",
};

export const zeroSkillBreakdown: SkillBreakdownScores = {
  content: { score: 0, feedback: "Awaiting first completed simulation." },
  structure: { score: 0, feedback: "Awaiting first completed simulation." },
  relevance: { score: 0, feedback: "Awaiting first completed simulation." },
  clarity: { score: 0, feedback: "Awaiting first completed simulation." },
  confidence: { score: 0, feedback: "Awaiting first completed simulation." },
  conciseness: { score: 0, feedback: "Awaiting first completed simulation." },
};

export interface IAnalyticsService {
  getUserProfile(): Promise<UserProfile>;
  getDashboardMetrics(): Promise<UserDashboardMetrics>;
  getSkillBreakdown(): Promise<SkillBreakdownScores>;
}

export class MockAnalyticsService implements IAnalyticsService {
  async getUserProfile(): Promise<UserProfile> {
    return Promise.resolve(mockUserProfile);
  }

  async getDashboardMetrics(): Promise<UserDashboardMetrics> {
    return Promise.resolve(zeroDashboardMetrics);
  }

  async getSkillBreakdown(): Promise<SkillBreakdownScores> {
    return Promise.resolve(zeroSkillBreakdown);
  }
}

export const analyticsService = new MockAnalyticsService();
