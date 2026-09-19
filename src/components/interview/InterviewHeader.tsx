import React from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Clock, XCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface InterviewHeaderProps {
  currentQuestionNumber: number;
  totalQuestions: number;
  timeElapsedSeconds: number;
  role: string;
  difficulty: string;
  onEndInterview: () => void;
}

export function InterviewHeader({
  currentQuestionNumber,
  totalQuestions,
  timeElapsedSeconds,
  role,
  difficulty,
  onEndInterview,
}: InterviewHeaderProps) {
  const percentage = Math.round((currentQuestionNumber / totalQuestions) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">
            Question {currentQuestionNumber} of {totalQuestions}
          </span>
          <Badge variant="brand" size="sm">
            {role}
          </Badge>
          <Badge variant="neutral" size="sm">
            {difficulty}
          </Badge>
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
