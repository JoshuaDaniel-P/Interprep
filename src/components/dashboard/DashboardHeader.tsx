import React from "react";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="mb-2 sm:mb-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
        Good morning, {userName}
      </h1>
      <p className="text-sm sm:text-base text-slate-500 font-semibold mt-1.5">
        Your interview preparation and readiness overview at a glance.
      </p>
    </div>
  );
}
