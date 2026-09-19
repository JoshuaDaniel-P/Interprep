import React from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Clock, XCircle, Building2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface InterviewHeaderProps {
  currentQuestionNumber: number;
  totalQuestions: number;
  timeElapsedSeconds: number;
  role: string;
  difficulty: string;
  company?: string;
  onEndInterview: () => void;
}

export function InterviewHeader({
  currentQuestionNumber,
  totalQuestions,
  timeElapsedSeconds,
  role,
  difficulty,
  company,
  onEndInterview,
}: InterviewHeaderProps) {
  const percentage = Math.min(Math.round((currentQuestionNumber / totalQuestions) * 100), 100);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Easy":
        return <Badge variant="success" size="sm">Easy</Badge>;
      case "Hard":
        return <Badge variant="danger" size="sm">Hard</Badge>;
      case "Adaptive":
        return <Badge variant="brand" size="sm" className="bg-purple-50 text-purple-700 border-purple-200">Adaptive</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Medium</Badge>;
    }
  };

  return (
    <div className="glass-secondary p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">
            Question {currentQuestionNumber} of ~{totalQuestions}
          </span>
          <Badge variant="brand" size="sm">
            {role}
          </Badge>
          {company && (
            <span className="glass-capsule inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold text-slate-700">
              <Building2 className="w-3 h-3 text-slate-500" />
              {company}
            </span>
          )}
          {getDifficultyBadge(difficulty)}
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-capsule flex items-center gap-1.5 text-xs font-bold text-slate-700 px-3.5 py-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatDuration(timeElapsedSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={onEndInterview}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50/90 border border-slate-200/60 hover:border-rose-200 transition-all gap-1.5 inline-flex items-center cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            End Early
          </button>
        </div>
      </div>

      <ProgressBar value={percentage} barClassName="glass-fluid-blue" />
    </div>
  );
}
