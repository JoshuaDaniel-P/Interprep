import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileSetupWizard } from "@/components/onboarding/ProfileSetupWizard";

export default function ProfileSetupPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Candidate Profile Setup
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Help PrepPilot understand who you are, your project experience, and what target role you are striving to achieve.
            </p>
          </div>

          <ProfileSetupWizard />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
