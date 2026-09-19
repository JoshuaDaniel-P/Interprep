import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      <div className={cn("w-full h-2 bg-gray-100 rounded-full overflow-hidden", className)}>
        <div
          className={cn("h-full bg-brand-600 rounded-full transition-all duration-300", barClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 text-xs text-gray-500 font-medium">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}
