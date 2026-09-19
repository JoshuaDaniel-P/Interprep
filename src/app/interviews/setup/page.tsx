"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { InterviewSetupForm } from "@/components/setup/InterviewSetupForm";

export default function InterviewSetupRoutePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-8 sm:space-y-10 max-w-5xl mx-auto pb-16">
          <div className="glass-primary p-8 sm:p-12 rounded-[36px] border-white/95 animate-section-stagger-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Configure Your Interview
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-1.5 leading-relaxed">
              Customize target role, company style, seniority expectations, and AI difficulty for your adaptive session.
            </p>
          </div>

          <div className="animate-section-stagger-2">
            <InterviewSetupForm />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
