import { CandidateProfile, TargetRoleTrack } from "@/types/candidate";

export interface GapAnalysisResult {
  readinessPercentage: number;
  roleTrack: TargetRoleTrack;
  keyGaps: {
    skillName: string;
    status: "Missing" | "Weak" | "Sufficient";
    recommendation: string;
  }[];
  nextFocusRecommendation: string;
}

export function calculateReadiness(
  profile: CandidateProfile,
  courseCompletionPercentage: number = 40,
  averageInterviewScore: number = 7.2
): GapAnalysisResult {
  let readiness = 0;

  // 1. Profile completeness (Max 25 pts)
  let profileScore = 10;
  if (profile.projects.length > 0) profileScore += 5;
  if (profile.skills.length >= 3) profileScore += 5;
  if (profile.education.degree) profileScore += 5;

  // 2. Course completion (Max 35 pts)
  const courseScore = Math.round((courseCompletionPercentage / 100) * 35);

  // 3. Interview performance (Max 40 pts)
  const interviewScore = Math.round((averageInterviewScore / 10) * 40);

  readiness = Math.min(Math.max(profileScore + courseScore + interviewScore, 0), 100);

  // Identify skill gaps based on role
  const roleGaps: Record<TargetRoleTrack, { skillName: string; recommendation: string }[]> = {
    "Software Developer": [
      { skillName: "Data Structures & Algorithms", recommendation: "Practice STAR answers on optimization trade-offs." },
      { skillName: "System Architecture", recommendation: "Review caching strategies and API gateway patterns." },
      { skillName: "SQL & Databases", recommendation: "Practice database indexing and join queries." },
    ],
    "Data Scientist": [
      { skillName: "Machine Learning Models", recommendation: "Review feature engineering and cross-validation." },
      { skillName: "Python & Pandas", recommendation: "Practice data wrangling questions." },
    ],
    "UI Designer": [
      { skillName: "Design System Governance", recommendation: "Review accessibility (a11y) standards and tokens." },
      { skillName: "User Research & Usability", recommendation: "Structure case studies clearly." },
    ],
    "Product Manager": [
      { skillName: "PRD & Feature Prioritization", recommendation: "Practice RICE & MoSCoW prioritization frameworks." },
      { skillName: "Product Analytics", recommendation: "Define key metrics for new product launches." },
    ],
    "College Lecturer": [
      { skillName: "Pedagogy & Curriculum Design", recommendation: "Practice active learning and syllabus structuring." },
      { skillName: "Research & Academic Writing", recommendation: "Highlight key publications and teaching style." },
    ],
  };

  const targetRole = profile.targetGoal.targetRole || "Software Developer";
  const gapsForRole = roleGaps[targetRole] || roleGaps["Software Developer"];

  const keyGaps = gapsForRole.map((g, idx) => ({
    skillName: g.skillName,
    status: idx === 0 ? ("Weak" as const) : ("Missing" as const),
    recommendation: g.recommendation,
  }));

  const nextFocusRecommendation =
    keyGaps[0]?.recommendation ||
    "Complete your next role module and take a practice mock interview to boost readiness.";

  return {
    readinessPercentage: readiness,
    roleTrack: targetRole,
    keyGaps,
    nextFocusRecommendation,
  };
}
