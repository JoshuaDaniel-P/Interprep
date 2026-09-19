import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ResultsEvaluationView } from "@/components/results/ResultsEvaluationView";

export default function ResultsPage() {
  return (
    <AppShell>
      <ResultsEvaluationView />
    </AppShell>
  );
}
