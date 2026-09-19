export type TargetRoleTrack =
  | "Software Engineer"
  | "Software Developer"
  | "Frontend Developer"
  | "Backend Developer"
  | "DevOps & Cloud Engineer"
  | "Data Scientist"
  | "Data Analyst"
  | "Embedded Systems Engineer"
  | "Mechanical Design Engineer"
  | "Civil & Structural Engineer"
  | "UI Designer"
  | "Product Manager"
  | "College Lecturer"
  | "Marketing"
  | "Sales"
  | string;

export type EmploymentStatus = "Student" | "Graduate" | "Employed" | "Unemployed";

export type SkillProficiency = "Beginner" | "Intermediate" | "Advanced";

export interface TechnicalSkill {
  id: string;
  name: string;
  proficiency: SkillProficiency;
  yearsOfExperience: number;
  howLearned?: string;
  usedInProjects?: string[];
  topicsKnown?: string[];
  topicsWeak?: string[];
}

export interface CandidateProject {
  id: string;
  name: string;
  problemStatement: string;
  technologies: string[];
  candidateContribution: string;
  teamSize: number;
  challenges: string;
  solution: string;
  results: string;
  demoUrl?: string;
}

export interface CandidateEducation {
  highestQualification: string;
  degree: string;
  branch: string;
  institution: string;
  graduationYear: number;
  cgpaOrPercentage: string;
  strongSubjects: string[];
  weakSubjects: string[];
}

export interface CandidateExperience {
  id: string;
  organization: string;
  position: string;
  durationMonths: number;
  responsibilities: string;
  technologiesUsed: string[];
}

export interface TargetGoalConfig {
  targetRole: TargetRoleTrack;
  targetCompanyType: string;
  targetIndustry: string;
  interviewType: "Behavioral" | "Technical" | "HR" | "Mixed";
  difficulty: "Comfortable" | "Realistic" | "Pressure";
  targetDate?: string;
}

export interface CandidateProfile {
  uid: string;
  email: string;
  fullName: string;
  ageGroup?: string;
  city?: string;
  languages?: string[];
  status: EmploymentStatus;
  bio?: string;
  education: CandidateEducation;
  skills: TechnicalSkill[];
  projects: CandidateProject[];
  experience: CandidateExperience[];
  achievements: string[];
  targetGoal: TargetGoalConfig;
  isOnboarded: boolean;
  readinessPercentage: number;
  createdAt: string;
  updatedAt: string;
}
