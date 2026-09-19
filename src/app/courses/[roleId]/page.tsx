"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { courseService } from "@/services/course.service";
import { TargetRoleTrack } from "@/types/candidate";
import { TargetRoleCourse, CourseModule, CourseLesson } from "@/types/course";
import { InterviewConfig, TargetRole } from "@/types/interview";
import { BookOpen, CheckCircle, PlayCircle, Lightbulb, ArrowLeft, Rocket } from "lucide-react";

interface CourseDetailPageProps {
  params: {
    roleId: string;
  };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const roleTrack = decodeURIComponent(params.roleId) as TargetRoleTrack;
  const course = courseService.getCourseForRole(roleTrack);

  const router = useRouter();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(["l-101"]);
  const [activeLessonId, setActiveLessonId] = useState<string>("l-101");

  const totalLessons = course.modules.reduce((acc: number, m: CourseModule) => acc + m.lessons.length, 0);
  const completionPercentage = Math.round((completedLessonIds.length / totalLessons) * 100);

  const activeLesson = course.modules
    .flatMap((m: CourseModule) => m.lessons)
    .find((l: CourseLesson) => l.id === activeLessonId) || course.modules[0]?.lessons[0];

  const toggleLesson = (id: string) => {
    if (completedLessonIds.includes(id)) {
      setCompletedLessonIds(completedLessonIds.filter((item) => item !== id));
    } else {
      setCompletedLessonIds([...completedLessonIds, id]);
    }
  };

  const handlePracticeTopic = (lesson = activeLesson) => {
    if (!lesson) return;
    const targetRole = (course.roleTrack === "Software Developer" ? "Software Engineer" : course.roleTrack) as TargetRole;
    const moduleConfig: InterviewConfig = {
      targetRole,
      companyType: "Product Company",
      company: "Tech Corp",
      experienceLevel: "2–5 years",
      interviewType: "Mixed",
      mode: "Text",
      difficulty: "Adaptive",
      questionCount: 4,
      targetQuestionsCount: 4,
      courseTrack: course.roleTrack,
      moduleTopic: lesson.title,
      practicePrompt: lesson.practicePrompt,
      keyTopics: lesson.keyTopics,
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("preppilot_active_config", JSON.stringify(moduleConfig));
    }
    router.push("/interview");
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/courses" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to All Roadmaps
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {course.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{course.tagline}</p>
          </div>

          <Button size="lg" className="gap-2 shrink-0" onClick={() => handlePracticeTopic(activeLesson)}>
            <PlayCircle className="w-5 h-5" />
            Practice Mock Interview
          </Button>
        </div>

        {/* Progress Card */}
        <Card className="bg-brand-50/50 border-brand-200">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
                Simulation Preparedness
              </span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {completionPercentage}% Complete
              </p>
            </div>

            <div className="w-full sm:w-1/2 space-y-2">
              <ProgressBar value={completionPercentage} barClassName="bg-brand-600 h-3" />
              <p className="text-xs text-slate-500 text-right">
                {completedLessonIds.length} of {totalLessons} simulation stages mastered
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Simulation Stages */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Simulation Modules
            </h3>

            {course.modules.map((module: CourseModule) => (
              <Card key={module.id}>
                <CardHeader className="py-3 bg-slate-50/50">
                  <CardTitle className="text-xs font-bold text-slate-900">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {module.lessons.map((lesson: CourseLesson) => {
                    const isDone = completedLessonIds.includes(lesson.id);
                    const isActive = activeLessonId === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                          isActive
                            ? "bg-brand-50 text-brand-900 font-bold border border-brand-300"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLesson(lesson.id);
                            }}
                            className={`w-4 h-4 cursor-pointer ${
                              isDone ? "text-emerald-600 fill-emerald-50" : "text-slate-300"
                            }`}
                          />
                          <span>{lesson.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{lesson.durationMinutes}m</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column: Active Simulation Stage */}
          <div className="lg:col-span-2">
            {activeLesson && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-600" />
                    {activeLesson.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulation Focus & Objective</h4>
                    <p className="text-sm text-slate-800 mt-1 leading-relaxed">{activeLesson.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evaluated Skills & Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeLesson.keyTopics.map((topic: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Active Simulation Challenge Prompt
                    </div>
                    <p className="text-sm text-amber-950 font-medium leading-relaxed">
                      &ldquo;{activeLesson.practicePrompt}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button
                      variant={completedLessonIds.includes(activeLesson.id) ? "secondary" : "primary"}
                      onClick={() => toggleLesson(activeLesson.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {completedLessonIds.includes(activeLesson.id) ? "Mark Incomplete" : "Mark Mastered"}
                    </Button>

                    <Button variant="outline" className="gap-2 bg-brand-50/80 text-brand-700 border-brand-200 hover:bg-brand-100" onClick={() => handlePracticeTopic(activeLesson)}>
                      <Rocket className="w-4 h-4 text-brand-600" />
                      Launch Simulation Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
