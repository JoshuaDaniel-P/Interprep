import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { initialRoleCourses } from "@/data/courses/courseData";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

export default function CoursesCatalogPage() {
  const courses = Object.values(initialRoleCourses);

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Interview Simulation Roadmaps
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Progressive mock interview practice tracks across all engineering branches, data domains, and tech roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between hover:border-brand-300 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                    {course.roleTrack}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>{course.modules.length} Core Modules</span>
                  <span>
                    {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Practice Stages
                  </span>
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <Link href={`/courses/${encodeURIComponent(course.roleTrack)}`}>
                  <Button variant="outline" className="w-full gap-2 justify-between">
                    <span>Explore Practice Track</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
