import React from "react";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        Good morning, {userName}
      </h1>
      <p className="text-sm text-slate-500 font-semibold mt-1">
        Your interview preparation at a glance.
      </p>
    </div>
  );
}
