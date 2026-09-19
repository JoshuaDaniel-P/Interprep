import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CandidateOnboardingForm } from "@/components/onboarding/CandidateOnboardingForm";

export default function OnboardingPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Candidate Onboarding Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Understand who you are, your projects, and what goal you are striving to achieve.
          </p>
        </div>

        <CandidateOnboardingForm />
      </div>
    </AppShell>
  );
}
