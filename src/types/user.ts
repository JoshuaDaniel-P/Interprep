export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  targetRole: string;
  joinedDate: string;
}

export interface MetricTrendPoint {
  date: string;
  score: number;
}

export interface UserDashboardMetrics {
  interviewsCompleted: number;
  averageScore: number;
  practiceStreakDays: number;
  improvementPercentage: number;
  scoreTrend: MetricTrendPoint[];
  topRecommendation: string;
}
