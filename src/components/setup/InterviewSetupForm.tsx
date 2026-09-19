"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TargetRole,
  CompanyType,
  ExperienceLevel,
  InterviewType,
  InterviewMode,
  Difficulty,
  InterviewConfig,
} from "@/types/interview";
import { SelectCardGroup, OptionItem } from "./SelectCardGroup";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PlayCircle, Sparkles } from "lucide-react";

const roleOptions: OptionItem<TargetRole>[] = [
  { value: "Software Engineer", label: "Software Engineer", description: "General full-stack & problem solving" },
  { value: "Frontend Developer", label: "Frontend Developer", description: "React, UI performance, web APIs" },
  { value: "Backend Developer", label: "Backend Developer", description: "APIs, microservices, databases" },
  { value: "Data Analyst", label: "Data Analyst", description: "SQL, data pipelines, metrics" },
  { value: "Product Manager", label: "Product Manager", description: "Product strategy & execution" },
  { value: "Marketing", label: "Marketing", description: "Growth, messaging, acquisition" },
  { value: "Sales", label: "Sales", description: "Client pitching, objection handling" },
];

const companyOptions: OptionItem<CompanyType>[] = [
  { value: "Startup", label: "Startup", description: "Fast-paced, high autonomy" },
  { value: "Product Company", label: "Product Company", description: "Product-led tech organization" },
  { value: "Service Company", label: "Service Company", description: "Client projects & agency work" },
  { value: "Consulting", label: "Consulting", description: "Strategic advisory & solutions" },
  { value: "Fintech", label: "Fintech", description: "Financial systems & compliance" },
  { value: "Enterprise", label: "Enterprise", description: "Large scale systems & processes" },
];

const experienceOptions: OptionItem<ExperienceLevel>[] = [
  { value: "Student", label: "Student / Intern", description: "Academic & entry-level projects" },
  { value: "0–2 years", label: "0–2 years (Junior)", description: "Foundational industry experience" },
  { value: "2–5 years", label: "2–5 years (Mid-Level)", description: "Independent contributor & features" },
  { value: "5+ years", label: "5+ years (Senior+)", description: "System design & technical leadership" },
];

const typeOptions: OptionItem<InterviewType>[] = [
  { value: "Behavioral", label: "Behavioral", description: "STAR method, teamwork & conflict" },
  { value: "Technical", label: "Technical & System Design", description: "Architecture, trade-offs & logic" },
  { value: "HR", label: "HR & Culture Fit", description: "Values, career goals & motivations" },
  { value: "Mixed", label: "Mixed Round", description: "Combination of technical & behavioral" },
];

const modeOptions: OptionItem<InterviewMode>[] = [
  { value: "Text", label: "Text Interview", description: "Interactive text-based adaptive Q&A" },
  { value: "Voice", label: "Voice Interview", description: "Browser Speech-to-Text & AI Voice Questions" },
];

const difficultyOptions: OptionItem<Difficulty>[] = [
  { value: "Comfortable", label: "Comfortable", description: "Supportive tone, straightforward questions" },
  { value: "Realistic", label: "Realistic", description: "Standard professional interview standard" },
  { value: "Pressure", label: "Pressure", description: "Rigorous follow-ups & metrics probing" },
];

const questionLengthOptions: OptionItem<number>[] = [
  { value: 0, label: "Stream Auto-Tuned", description: "Auto-tuned questions based on selected stream (4–6 Qs)" },
  { value: 3, label: "3 Questions (Quick)", description: "Fast mock interview session" },
  { value: 5, label: "5 Questions (Standard)", description: "Standard balanced evaluation" },
  { value: 7, label: "7 Questions (Deep Dive)", description: "Comprehensive pressure test" },
];

export function InterviewSetupForm() {
  const router = useRouter();

  const [config, setConfig] = useState<InterviewConfig>({
    targetRole: "Software Engineer",
    companyType: "Product Company",
    experienceLevel: "2–5 years",
    interviewType: "Behavioral",
    mode: "Text",
    difficulty: "Realistic",
    questionCount: 0,
  });

  const [isStarting, setIsStarting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("preppilot_active_config", JSON.stringify(config));
    }

    router.push("/interview");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Target Role */}
      <Card>
        <CardContent className="p-6">
          <SelectCardGroup
            label="1. Target Role"
            description="Select the job role you are interviewing for."
            options={roleOptions}
            selectedValue={config.targetRole}
            onChange={(targetRole) => setConfig((prev) => ({ ...prev, targetRole }))}
            columns={3}
          />
        </CardContent>
      </Card>

      {/* 2. Company Type & Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="2. Company Type"
              description="Tailors the interviewer's perspective and expectations."
              options={companyOptions}
              selectedValue={config.companyType}
              onChange={(companyType) => setConfig((prev) => ({ ...prev, companyType }))}
              columns={2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="3. Experience Level"
              description="Determines question complexity and seniority expectations."
              options={experienceOptions}
              selectedValue={config.experienceLevel}
              onChange={(experienceLevel) => setConfig((prev) => ({ ...prev, experienceLevel }))}
              columns={2}
            />
          </CardContent>
        </Card>
      </div>

      {/* 4. Interview Type & Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="4. Interview Type"
              description="Choose the focus area of this session."
              options={typeOptions}
              selectedValue={config.interviewType}
              onChange={(interviewType) => setConfig((prev) => ({ ...prev, interviewType }))}
              columns={2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="5. Difficulty Level"
              description="Controls how challenging the follow-up questions will be."
              options={difficultyOptions}
              selectedValue={config.difficulty}
              onChange={(difficulty) => setConfig((prev) => ({ ...prev, difficulty }))}
              columns={2}
            />
          </CardContent>
        </Card>
      </div>

      {/* 6. Question Count & Interview Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="6. Question Count"
              description="Choose question length or auto-tune per stream."
              options={questionLengthOptions}
              selectedValue={config.questionCount || 0}
              onChange={(questionCount) => setConfig((prev) => ({ ...prev, questionCount }))}
              columns={2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="7. Interview Mode"
              description="Choose how you want to conduct the interview."
              options={modeOptions}
              selectedValue={config.mode}
              onChange={(mode) => setConfig((prev) => ({ ...prev, mode }))}
              columns={2}
            />
          </CardContent>
        </Card>
      </div>

      {/* Summary Banner & Action */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Summary Configuration</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {config.targetRole} • {config.companyType} • {config.interviewType} ({config.difficulty}) • {config.mode} Mode
            </p>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isStarting}
          className="w-full sm:w-auto px-8 gap-2"
        >
          <PlayCircle className="w-5 h-5" />
          Start Interview
        </Button>
      </div>
    </form>
  );
}
