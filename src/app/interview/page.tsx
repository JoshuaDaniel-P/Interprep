"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { InterviewProvider } from "@/context/InterviewContext";
import { InterviewWorkspace } from "@/components/interview/InterviewWorkspace";

export default function InterviewPage() {
  return (
    <AppShell>
      <InterviewProvider>
        <InterviewWorkspace />
      </InterviewProvider>
    </AppShell>
  );
}
