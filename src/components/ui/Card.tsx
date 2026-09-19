import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "bordered" | "glass" | "glass-primary";
}

export function Card({
  className,
  children,
  variant = "default",
  ...props
}: CardProps) {
  const variants = {
    default: "glass-secondary transition-all",
    glass: "glass-secondary transition-all",
    "glass-primary": "glass-primary transition-all",
    flat: "bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 shadow-xs",
    bordered: "glass-secondary transition-all",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-200/40", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-extrabold text-slate-900 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
