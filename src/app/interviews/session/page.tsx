"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { InterviewProvider } from "@/context/InterviewContext";
import { InterviewWorkspace } from "@/components/interview/InterviewWorkspace";

export default function InterviewSessionRoutePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <InterviewProvider>
          <InterviewWorkspace />
        </InterviewProvider>
      </AppShell>
    </ProtectedRoute>
  );
}
