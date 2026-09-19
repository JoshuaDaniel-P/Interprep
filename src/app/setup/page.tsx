"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { InterviewSetupForm } from "@/components/setup/InterviewSetupForm";

export default function SetupPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Configure Your Interview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Customize role, company, difficulty, and format for your practice session.
            </p>
          </div>

          <InterviewSetupForm />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
