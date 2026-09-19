import React from "react";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
        Good morning, {userName}
      </h1>
      <p className="text-sm sm:text-base text-gray-500 mt-1">
        Your interview preparation at a glance.
      </p>
    </div>
  );
}
