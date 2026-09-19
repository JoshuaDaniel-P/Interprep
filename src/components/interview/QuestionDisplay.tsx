import React from "react";
import { InterviewQuestion } from "@/types/interview";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles, CornerDownRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface QuestionDisplayProps {
  question: InterviewQuestion;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <Card className="border-brand-200/60 shadow-xs">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              AI Interviewer
            </span>
          </div>

          {question.isFollowUp ? (
            <Badge variant="warning" size="sm" className="gap-1">
              <CornerDownRight className="w-3 h-3" />
              Contextual Follow-up Question
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              {question.category || "Core Question"}
            </Badge>
          )}
        </div>

        <div className="pt-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
            &ldquo;{question.text}&rdquo;
          </h2>
        </div>
      </CardContent>
    </Card>
  );
}
