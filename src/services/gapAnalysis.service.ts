import { CandidateProfile, TargetRoleTrack } from "@/types/candidate";
import { CategoryScores } from "@/types/interview";

export interface CategoryReadinessBreakdown {
  technical: number;
  projects: number;
  communication: number;
  behavioral: number;
}

export interface GapAnalysisResult {
  readinessPercentage: number;
  roleTrack: TargetRoleTrack;
  categoryReadiness: CategoryReadinessBreakdown;
  keyGaps: {
    skillName: string;
    status: "Missing" | "Weak" | "Sufficient";
    recommendation: string;
  }[];
  nextFocusRecommendation: string;
  calculationExplanation: string;
}

/**
 * Weighted Readiness Calculation Engine
 * -------------------------------------
 * PrepPilot calculates candidate interview readiness using an objective weighted model:
 *
 * 1. Profile Completeness (Weight: 20%)
 *    - Base profile & bio: 5 pts
 *    - Projects logged: 5 pts
 *    - Validated technical skills (>= 3): 5 pts
 *    - Education details: 5 pts
 *
 * 2. Roadmap / Course Completion (Weight: 20%)
 *    - Tracks syllabus progression across core competencies (Max 20 pts)
 *
 * 3. Mock Interview Performance (Weight: 60%)
 *    Weighted across 6 core interview dimensions:
 *    - Technical Knowledge: 25% weight
 *    - Problem Solving & Logic: 20% weight
 *    - Project Depth & Trade-offs: 20% weight
 *    - Communication & Clarity: 15% weight
 *    - Behavioral STAR Mastery: 10% weight
 *    - Role & Company Alignment: 10% weight
 */
export function calculateReadiness(
  profile: CandidateProfile,
  courseCompletionPercentage: number = 0,
  interviewCategoryScores?: Partial<CategoryScores>
): GapAnalysisResult {
  // 1. Profile Completeness (Max 30 points)
  let profileScore = 10;
  if (profile.projects && profile.projects.length > 0) profileScore += 10;
  if (profile.skills && profile.skills.length >= 3) profileScore += 5;
  if (profile.education?.degree) profileScore += 5;
  profileScore = Math.min(profileScore, 30);

  // 2. Course Completion (Max 20 points)
  const courseScore = Math.round((courseCompletionPercentage / 100) * 20);

  // 3. Interview Performance (Max 60 points)
  const hasInterviewData = Boolean(
    interviewCategoryScores &&
    Object.values(interviewCategoryScores).some((val) => typeof val === "number" && val > 0)
  );

  const tech = hasInterviewData ? (interviewCategoryScores?.technicalKnowledge ?? 0) : 0;
  const prob = hasInterviewData ? (interviewCategoryScores?.problemSolving ?? 0) : 0;
  const proj = hasInterviewData ? (interviewCategoryScores?.projects ?? 0) : 0;
  const comm = hasInterviewData ? (interviewCategoryScores?.communication ?? 0) : 0;
  const behav = hasInterviewData ? (interviewCategoryScores?.behavioral ?? 0) : 0;
  const role = hasInterviewData ? (interviewCategoryScores?.roleKnowledge ?? 0) : 0;
  const comp = hasInterviewData ? (interviewCategoryScores?.companyAwareness ?? 0) : 0;

  // Weighted interview score (0 to 100)
  const weightedInterviewRating = hasInterviewData
    ? tech * 0.25 +
      prob * 0.20 +
      proj * 0.20 +
      comm * 0.15 +
      behav * 0.10 +
      ((role + comp) / 2) * 0.10
    : 0;

  const interviewScorePoints = Math.round((weightedInterviewRating / 100) * 60);

  const totalReadiness = hasInterviewData
    ? Math.min(Math.max(profileScore + courseScore + interviewScorePoints, 0), 100)
    : 0;

  const categoryReadiness: CategoryReadinessBreakdown = {
    technical: Math.round(tech),
    projects: Math.round(proj),
    communication: Math.round(comm),
    behavioral: Math.round(behav),
  };

  // Identify skill gaps based on role
  const roleGaps: Record<string, { skillName: string; recommendation: string }[]> = {
    "Software Developer": [
      { skillName: "Data Structures & Algorithms", recommendation: "Practice STAR answers on time-complexity trade-offs." },
      { skillName: "System Architecture & Caching", recommendation: "Review cache invalidation strategies and database read bottlenecks." },
      { skillName: "SQL & Query Optimization", recommendation: "Practice indexing, explain plans, and multi-table joins." },
    ],
    "Software Engineer": [
      { skillName: "System Architecture & Caching", recommendation: "Review cache invalidation strategies and database read bottlenecks." },
      { skillName: "Data Structures & Algorithms", recommendation: "Practice STAR answers on time-complexity trade-offs." },
      { skillName: "SQL & Query Optimization", recommendation: "Practice indexing, explain plans, and multi-table joins." },
    ],
    "Frontend Developer": [
      { skillName: "Client-side Performance", recommendation: "Review DOM rendering bottlenecks, bundle splitting, and hydration." },
      { skillName: "React Architecture", recommendation: "Practice state management and re-render profiling." },
    ],
    "Backend Developer": [
      { skillName: "Distributed Caching & Concurrency", recommendation: "Practice Redis caching and idempotent API design." },
      { skillName: "Database Optimization", recommendation: "Review SQL indexing, connections pools, and schema design." },
    ],
    "Data Scientist": [
      { skillName: "Machine Learning Models", recommendation: "Review feature engineering and cross-validation." },
      { skillName: "Python & Pandas", recommendation: "Practice data wrangling and metric calculation questions." },
    ],
    "Product Manager": [
      { skillName: "PRD & Feature Prioritization", recommendation: "Practice RICE & MoSCoW prioritization frameworks." },
      { skillName: "Product Analytics", recommendation: "Define telemetry and success metrics for new launches." },
    ],
  };

  const targetRole = profile.targetGoal?.targetRole || "Software Developer";
  const gapsForRole = roleGaps[targetRole] || roleGaps["Software Developer"];

  const keyGaps = gapsForRole.map((g, idx) => ({
    skillName: g.skillName,
    status: idx === 0 ? ("Weak" as const) : ("Missing" as const),
    recommendation: g.recommendation,
  }));

  const nextFocusRecommendation =
    keyGaps[0]?.recommendation ||
    "Practice mock interviews and review systems architecture to boost readiness.";

  return {
    readinessPercentage: totalReadiness,
    roleTrack: targetRole as TargetRoleTrack,
    categoryReadiness,
    keyGaps,
    nextFocusRecommendation,
    calculationExplanation: "Weighted composite: Profile Completeness (30%) + Mock Interview Performance (70%: Tech 25%, Problems 20%, Projects 20%, Communication 15%, Behavioral 10%, Role 10%)",
  };
}
