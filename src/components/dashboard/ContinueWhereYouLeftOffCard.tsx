import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlayCircle, BookOpen, Clock, ArrowRight } from "lucide-react";

interface ContinueWhereYouLeftOffCardProps {
  targetRole: string;
  lastLessonTitle?: string;
  completionPercentage?: number;
}

export function ContinueWhereYouLeftOffCard({
  targetRole,
  lastLessonTitle = "Redis Caching Strategies & DB Read Bottlenecks",
  completionPercentage = 40,
}: ContinueWhereYouLeftOffCardProps) {
  return (
    <Card className="border-brand-200/80 bg-white">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider block">
              Continue Your Preparation
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              &ldquo;{lastLessonTitle}&rdquo;
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Progress: {completionPercentage}% completed for {targetRole}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/courses/${encodeURIComponent(targetRole)}`} className="w-full sm:w-auto">
            <Button size="md" className="w-full sm:w-auto gap-2 px-6">
              <PlayCircle className="w-4 h-4" />
              Continue Lesson
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
