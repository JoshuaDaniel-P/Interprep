import { TargetRoleTrack } from "./candidate";
export type { TargetRoleTrack };

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  summary: string;
  keyTopics: string[];
  practicePrompt: string;
  isCompleted?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface TargetRoleCourse {
  id: string;
  roleTrack: TargetRoleTrack;
  title: string;
  tagline: string;
  description: string;
  modules: CourseModule[];
}

export interface CandidateCourseProgress {
  uid: string;
  roleTrack: TargetRoleTrack;
  completedLessonIds: string[];
  lastLessonId?: string;
  lastModuleId?: string;
  lastAccessedAt: string;
  completionPercentage: number;
}
