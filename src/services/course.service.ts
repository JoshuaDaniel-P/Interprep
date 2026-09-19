import { TargetRoleCourse, CandidateCourseProgress, TargetRoleTrack } from "@/types/course";
import { initialRoleCourses } from "@/data/courses/courseData";

export class CourseService {
  getCourseForRole(roleTrack: TargetRoleTrack): TargetRoleCourse {
    return initialRoleCourses[roleTrack] || initialRoleCourses["Software Developer"];
  }

  async getCandidateProgress(uid: string, roleTrack: TargetRoleTrack): Promise<CandidateCourseProgress> {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(`preppilot_course_progress_${uid}_${roleTrack}`);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const defaultProgress: CandidateCourseProgress = {
      uid,
      roleTrack,
      completedLessonIds: ["l-101"],
      lastLessonId: "l-102",
      lastModuleId: "m-1",
      lastAccessedAt: new Date().toISOString(),
      completionPercentage: 40,
    };

    return defaultProgress;
  }

  async completeLesson(
    uid: string,
    roleTrack: TargetRoleTrack,
    lessonId: string
  ): Promise<CandidateCourseProgress> {
    const progress = await this.getCandidateProgress(uid, roleTrack);
    const updatedCompleted = Array.from(new Set([...progress.completedLessonIds, lessonId]));
    
    const course = this.getCourseForRole(roleTrack);
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const percentage = totalLessons > 0 ? Math.round((updatedCompleted.length / totalLessons) * 100) : 0;

    const updatedProgress: CandidateCourseProgress = {
      ...progress,
      completedLessonIds: updatedCompleted,
      lastLessonId: lessonId,
      completionPercentage: percentage,
      lastAccessedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`preppilot_course_progress_${uid}_${roleTrack}`, JSON.stringify(updatedProgress));
    }

    return updatedProgress;
  }
}

export const courseService = new CourseService();
