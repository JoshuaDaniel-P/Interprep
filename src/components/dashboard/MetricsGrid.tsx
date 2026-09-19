import React from "react";
import { UserDashboardMetrics } from "@/types/user";
import { Card, CardContent } from "@/components/ui/Card";
import { Target, Award, Flame, TrendingUp } from "lucide-react";

interface MetricsGridProps {
  metrics: UserDashboardMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const items = [
    {
      title: "Interviews Completed",
      value: metrics.interviewsCompleted,
      unit: "sessions",
      icon: Target,
      iconColor: "text-brand-600 bg-brand-50",
    },
    {
      title: "Average Score",
      value: metrics.averageScore.toFixed(1),
      unit: "/ 10",
      icon: Award,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Practice Streak",
      value: metrics.practiceStreakDays,
      unit: "days",
      icon: Flame,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Improvement",
      value: metrics.improvementPercentage > 0 ? `+${metrics.improvementPercentage}%` : "0%",
      unit: "overall",
      icon: TrendingUp,
      iconColor: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title} className="hover:border-gray-300 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {item.title}
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                  <span className="text-xs text-gray-500 font-medium">{item.unit}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${item.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
