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
      subtitle: "Verified mock evaluations",
      value: metrics.interviewsCompleted,
      unit: "sessions",
      icon: Target,
      iconColor: "text-blue-600",
      badge: "Real-time",
    },
    {
      title: "Average Score",
      subtitle: "Out of 10.0 scale",
      value: metrics.averageScore.toFixed(1),
      unit: "/ 10",
      icon: BarChart2,
      iconColor: "text-blue-600",
      badge: "Cumulative",
    },
    {
      title: "Practice Streak",
      subtitle: "Consistency momentum",
      value: metrics.practiceStreakDays,
      unit: "days",
      icon: Flame,
      iconColor: "text-amber-600",
      badge: "Active",
    },
    {
      title: "Overall Improvement",
      subtitle: "Skill growth baseline",
      value: metrics.improvementPercentage > 0 ? `+${metrics.improvementPercentage}%` : "0%",
      unit: "gain",
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      badge: "Trajectory",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="glass-primary p-6 sm:p-8 rounded-[28px] flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group border-white/95"
            data-config='{"refraction": 0.2, "edgeHighlight": 0.85, "specular": 0.8, "zRadius": 18, "cornerRadius": 28}'
          >
            {/* Top Row: Prominent Glass Icon Bubble & Badge */}
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center glass-capsule border-white/95 shadow-xs transition-transform group-hover:scale-105 ${item.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>

              <span className="glass-capsule px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 border-white/80">
                {item.badge}
              </span>
            </div>

            {/* Bottom Content: Big Confident Metrics & Typography */}
            <div className="space-y-1 pt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-500">
                  {item.unit}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                {item.title}
              </p>
              
              <p className="text-[11px] font-medium text-slate-500 leading-tight">
                {item.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
