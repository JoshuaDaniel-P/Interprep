import React from "react";
import { UserDashboardMetrics } from "@/types/user";
import { Target, BarChart2, Flame, TrendingUp } from "lucide-react";

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
      iconColor: "text-blue-600",
    },
    {
      title: "Average Score",
      value: metrics.averageScore.toFixed(1),
      unit: "/ 10",
      icon: BarChart2,
      iconColor: "text-blue-600",
    },
    {
      title: "Practice Streak",
      value: metrics.practiceStreakDays,
      unit: "days",
      icon: Flame,
      iconColor: "text-amber-600",
    },
    {
      title: "Improvement",
      value: `+${metrics.improvementPercentage}%`,
      unit: "overall",
      icon: TrendingUp,
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="glass liquid-glass-capsule p-4 flex items-center gap-3.5"
            data-config='{"refraction": 0.18, "edgeHighlight": 0.75, "specular": 0.8, "zRadius": 14, "cornerRadius": 9999}'
          >
            {/* Small Glass Icon Bubble */}
            <div className={`w-10 h-10 mockup-icon-circle ${item.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {item.unit}
                </span>
              </div>
              <p className="text-[11px] font-extrabold text-slate-600 leading-tight">
                {item.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
