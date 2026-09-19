import React from "react";
import { SkillBreakdownScores } from "@/types/evaluation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface SkillBreakdownProps {
  skills: SkillBreakdownScores;
}

export function SkillBreakdown({ skills }: SkillBreakdownProps) {
  const skillItems = [
    { key: "Content", score: skills.content.score, description: skills.content.feedback },
    { key: "Structure", score: skills.structure.score, description: skills.structure.feedback },
    { key: "Relevance", score: skills.relevance.score, description: skills.relevance.feedback },
    { key: "Clarity", score: skills.clarity.score, description: skills.clarity.feedback },
    { key: "Confidence", score: skills.confidence.score, description: skills.confidence.feedback },
    { key: "Conciseness", score: skills.conciseness.score, description: skills.conciseness.feedback },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-900">
          Skill Performance Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skillItems.map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-gray-700 font-semibold">{item.key}</span>
              <span className="text-gray-900 font-bold">{item.score.toFixed(1)} / 10</span>
            </div>
            <ProgressBar
              value={item.score * 10}
              barClassName={
                item.score >= 8.0
                  ? "bg-emerald-500"
                  : item.score >= 7.0
                  ? "bg-brand-600"
                  : "bg-amber-500"
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
