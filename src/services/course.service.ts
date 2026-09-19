import { TargetRoleCourse, TargetRoleTrack } from "@/types/course";
import { initialRoleCourses } from "@/data/courses/courseData";

export const courseService = {
  getAllCourses(): TargetRoleCourse[] {
    return Object.values(initialRoleCourses);
  },

  getCourseForRole(roleTrack: TargetRoleTrack): TargetRoleCourse {
    return (
      initialRoleCourses[roleTrack] ||
      initialRoleCourses["Software Developer"] ||
      Object.values(initialRoleCourses)[0]
    );
  },
};
