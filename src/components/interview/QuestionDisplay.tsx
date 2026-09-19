import React from "react";
import { InterviewQuestion } from "@/types/interview";
import { Card, CardContent } from "@/components/ui/Card";
import { Sparkles, CornerDownRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface QuestionDisplayProps {
  question: InterviewQuestion;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  const getQuestionTypeLabel = (type?: string) => {
    switch (type) {
      case "project":
        return "Candidate Project Deep Dive";
      case "candidate_specific":
        return "Candidate Specific Question";
      case "yes_no":
        return "Direct Yes/No Screening";
      case "behavioral":
        return "Behavioral Competency (STAR)";
      case "situational":
        return "Situational & Crisis Handling";
      case "problem_solving":
        return "System & Logic Problem Solving";
      case "company_oriented":
        return "Company Alignment & Mission";
      case "short_answer":
        return "Quick Technical Check";
      default:
        return "Core Technical Question";
    }
  };

  return (
    <Card className="border-brand-200/70 shadow-card">
      <CardContent className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                AI Adaptive Interviewer
              </span>
              <span className="text-[11px] text-gray-500">
                Evaluating real-time depth, trade-offs & clarity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {question.isFollowUp ? (
              <Badge variant="warning" size="sm" className="gap-1 font-semibold">
                <CornerDownRight className="w-3.5 h-3.5" />
                Adaptive Follow-up
              </Badge>
            ) : (
              <Badge variant="brand" size="sm" className="gap-1 font-semibold">
                <Tag className="w-3 h-3" />
                {question.category || getQuestionTypeLabel(question.questionType)}
              </Badge>
            )}

            {question.questionType === "yes_no" && (
              <Badge variant="neutral" size="sm" className="bg-purple-50 text-purple-700 border-purple-200">
                Yes/No
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
            &ldquo;{question.text}&rdquo;
          </h2>
          {question.followUpQuestionRelationship && (
            <p className="text-xs text-brand-700 mt-2 font-medium">
              ↳ {question.followUpQuestionRelationship}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
