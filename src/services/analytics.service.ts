import { UserDashboardMetrics, UserProfile } from "@/types/user";
import { SkillBreakdownScores } from "@/types/evaluation";
import { mockDashboardMetrics, mockUserProfile, mockSkillBreakdown } from "@/data/mock/dashboard.mock";

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
    return Promise.resolve(mockDashboardMetrics);
  }

  async getSkillBreakdown(): Promise<SkillBreakdownScores> {
    return Promise.resolve(mockSkillBreakdown);
  }
}

export const analyticsService = new MockAnalyticsService();
