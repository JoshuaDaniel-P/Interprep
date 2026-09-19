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
    <div
      className="glass liquid-glass-panel p-5 space-y-4"
      data-config='{"refraction": 0.22, "edgeHighlight": 0.85, "specular": 0.75, "zRadius": 18, "cornerRadius": 28}'
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-bold text-gray-900">
            Question {currentQuestionNumber} of ~{totalQuestions}
          </span>
          <Badge variant="brand" size="sm">
            {role}
          </Badge>
          {company && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              <Building2 className="w-3 h-3 text-gray-500" />
              {company}
            </span>
          )}
          {getDifficultyBadge(difficulty)}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{formatDuration(timeElapsedSeconds)}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onEndInterview}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            End Early
          </Button>
        </div>
      </div>

      <ProgressBar value={percentage} barClassName="bg-brand-600" />
    </div>
  );
}
