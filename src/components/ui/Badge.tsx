import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "neutral" | "success" | "warning" | "danger";
  size?: "sm" | "md";
}

export function Badge({
  className,
  children,
  variant = "neutral",
  size = "md",
  ...props
}: BadgeProps) {
  const variants = {
    brand: "bg-blue-50/90 text-blue-800 border-blue-200/90 shadow-xs",
    neutral: "bg-white/80 text-slate-700 border-white/95 shadow-xs",
    success: "bg-emerald-50/90 text-emerald-800 border-emerald-200/90 shadow-xs",
    warning: "bg-amber-50/90 text-amber-900 border-amber-200/90 shadow-xs",
    danger: "bg-rose-50/90 text-rose-800 border-rose-200/90 shadow-xs",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px] font-bold rounded-full backdrop-blur-sm",
    md: "px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border transition-all",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
