"use client";

import React, { useState, useEffect } from "react";
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
import { PlayCircle, Sparkles, Building2, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const roleOptions: OptionItem<TargetRole>[] = [
  { value: "Software Engineer", label: "Software Engineer", description: "General full-stack & systems problem solving" },
  { value: "Frontend Developer", label: "Frontend Developer", description: "React, web performance, UI architectures" },
  { value: "Backend Developer", label: "Backend Developer", description: "APIs, microservices, databases & scaling" },
  { value: "Data Analyst", label: "Data Analyst", description: "SQL, data pipelines, metric analysis" },
  { value: "Product Manager", label: "Product Manager", description: "Product strategy, trade-offs & execution" },
  { value: "Marketing", label: "Marketing", description: "Growth, messaging, customer acquisition" },
  { value: "Sales", label: "Sales", description: "Client pitching & objection handling" },
];

const companyOptions: OptionItem<CompanyType>[] = [
  { value: "Startup", label: "Startup", description: "Fast-paced, high autonomy & broad ownership" },
  { value: "Product Company", label: "Product Company", description: "Product-led tech organization & quality" },
  { value: "Service Company", label: "Service Company", description: "Client delivery & agile agency work" },
  { value: "Consulting", label: "Consulting", description: "Strategic advisory & enterprise solutions" },
  { value: "Fintech", label: "Fintech", description: "High security, compliance & low latency" },
  { value: "Enterprise", label: "Enterprise", description: "Large-scale distributed systems & processes" },
];

const experienceOptions: OptionItem<ExperienceLevel>[] = [
  { value: "Student", label: "Student / Intern", description: "Academic coursework & personal/hackathon projects" },
  { value: "0–2 years", label: "0–2 years (Junior)", description: "Foundational industry experience & core features" },
  { value: "2–5 years", label: "2–5 years (Mid-Level)", description: "Independent contributor, architecture & reliability" },
  { value: "5+ years", label: "5+ years (Senior+)", description: "System design, leadership & architectural trade-offs" },
];

const typeOptions: OptionItem<InterviewType>[] = [
  { value: "Mixed", label: "Mixed Round (Recommended)", description: "Realistic mix of technical, project & behavioral questions" },
  { value: "Technical", label: "Technical & System Design", description: "Architecture, trade-offs, coding logic & data" },
  { value: "Behavioral", label: "Behavioral & Leadership", description: "STAR method, teamwork, conflict & ownership" },
  { value: "HR", label: "HR & Culture Fit", description: "Career motivations, company alignment & goals" },
];

const modeOptions: OptionItem<InterviewMode>[] = [
<<<<<<< HEAD
  { value: "Text", label: "Text Interview", description: "Interactive text-based adaptive Q&A" },
  { value: "Voice", label: "Voice Interview", description: "Browser Speech-to-Text & AI Voice Questions" },
=======
  { value: "Text", label: "Text Interview", description: "Interactive real-time adaptive Q&A workspace" },
  { value: "Voice", label: "Voice Interview", description: "Voice mode coming soon", disabled: true },
>>>>>>> origin/main
];

const difficultyOptions: OptionItem<Difficulty>[] = [
  {
    value: "Easy",
    label: "Easy",
    description: "Fundamental questions with straightforward wording. Suitable for beginners.",
  },
  {
    value: "Medium",
    label: "Medium",
    description: "Mix of fundamental and practical questions with moderate follow-ups. Realistic interview difficulty.",
  },
  {
    value: "Hard",
    label: "Hard",
    description: "Deeper technical questions, challenging follow-ups, and scenario/problem-solving testing depth.",
  },
  {
    value: "Adaptive",
    label: "Adaptive (Smart)",
    description: "Dynamically raises difficulty on strong answers and adjusts when struggling. Dynamic follow-ups.",
  },
];

const questionLengthOptions: OptionItem<number>[] = [
  { value: 0, label: "Stream Auto-Tuned", description: "Auto-tuned questions based on selected stream (4–6 Qs)" },
  { value: 3, label: "3 Questions (Quick)", description: "Fast mock interview session" },
  { value: 5, label: "5 Questions (Standard)", description: "Standard balanced evaluation" },
  { value: 7, label: "7 Questions (Deep Dive)", description: "Comprehensive pressure test" },
];

export function InterviewSetupForm() {
  const router = useRouter();
  const { profile } = useAuth();

  const [config, setConfig] = useState<InterviewConfig>({
    targetRole: "Software Engineer",
    companyType: "Product Company",
    company: "",
    jobDescription: "",
    experienceLevel: "2–5 years",
    interviewType: "Mixed",
    mode: "Text",
<<<<<<< HEAD
    difficulty: "Realistic",
    questionCount: 0,
=======
    difficulty: "Adaptive",
    targetQuestionsCount: 15,
>>>>>>> origin/main
  });

  const [isStarting, setIsStarting] = useState(false);

  // Sync with profile defaults if available
  useEffect(() => {
    if (profile?.targetGoal) {
      setConfig((prev) => ({
        ...prev,
        targetRole: profile.targetGoal.targetRole || prev.targetRole,
        companyType: profile.targetGoal.targetCompanyType || prev.companyType,
      }));
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);

<<<<<<< HEAD
=======
    const finalConfig: InterviewConfig = {
      ...config,
      company: (config.company || "").trim() || config.companyType,
      targetQuestionsCount: 15,
    };

>>>>>>> origin/main
    if (typeof window !== "undefined") {
      sessionStorage.setItem("preppilot_active_config", JSON.stringify(finalConfig));
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
            description="Select the specific position you are interviewing for."
            options={roleOptions}
            selectedValue={config.targetRole}
            onChange={(targetRole) => setConfig((prev) => ({ ...prev, targetRole }))}
            columns={3}
          />
        </CardContent>
      </Card>

      {/* 2. Company Context */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <SelectCardGroup
            label="2. Company Type"
            description="Tailors the interviewer's perspective, culture expectations, and organizational scope."
            options={companyOptions}
            selectedValue={config.companyType}
            onChange={(companyType) => setConfig((prev) => ({ ...prev, companyType }))}
            columns={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1.5">
                <Building2 className="w-4 h-4 text-brand-600" />
                Target Company Name (Optional)
              </label>
              <input
                type="text"
                value={config.company}
                onChange={(e) => setConfig((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="e.g. Google, Amazon, Stripe, Databricks..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                The interviewer will tailor role-specific and company-oriented questions to this company.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                Job Description / Required Skills (Optional)
              </label>
              <textarea
                rows={2}
                value={config.jobDescription}
                onChange={(e) => setConfig((prev) => ({ ...prev, jobDescription: e.target.value }))}
                placeholder="Paste key requirements or tech stack focus (e.g. Node.js, Redis, distributed systems)..."
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Experience & Interview Round Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="3. Experience Level"
              description="Determines question complexity, autonomy, and seniority expectations."
              options={experienceOptions}
              selectedValue={config.experienceLevel}
              onChange={(experienceLevel) => setConfig((prev) => ({ ...prev, experienceLevel }))}
              columns={2}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="4. Round Focus"
              description="Choose the balance of questions in this practice session."
              options={typeOptions}
              selectedValue={config.interviewType}
              onChange={(interviewType) => setConfig((prev) => ({ ...prev, interviewType }))}
              columns={2}
            />
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
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
=======
      {/* 5. Interview Difficulty (Requirement 1) */}
      <Card>
        <CardContent className="p-6">
          <SelectCardGroup
            label="5. Interview Difficulty"
            description="Select how the AI interviewer evaluates answers and adapts follow-up depth."
            options={difficultyOptions}
            selectedValue={config.difficulty}
            onChange={(difficulty) => setConfig((prev) => ({ ...prev, difficulty }))}
            columns={2}
          />
        </CardContent>
      </Card>
>>>>>>> origin/main

      {/* 6. Mode & Interview Length */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="6. Interview Mode"
              description="Choose how you want to conduct the interview."
              options={modeOptions}
              selectedValue={config.mode}
              onChange={(mode) => setConfig((prev) => ({ ...prev, mode }))}
              columns={2}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              7. Mock Interview Length
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Comprehensive realistic interview standard (~15 questions).
            </p>
            <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-brand-950 block">Target ~15 Questions</span>
                <span className="text-xs text-brand-800">
                  Includes candidate project deep-dives, architecture, behavioral STAR, and Yes/No screenings.
                </span>
              </div>
              <span className="px-3 py-1 bg-brand-600 text-white rounded-full text-xs font-bold shrink-0">
                15 Qs
              </span>
            </div>
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
<<<<<<< HEAD
              {config.targetRole} • {config.companyType} • {config.interviewType} ({config.difficulty}) • {config.mode} Mode
=======
              {config.targetRole} • {config.company || config.companyType} • {config.difficulty} Difficulty (~15 Questions)
>>>>>>> origin/main
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
          Start Realistic Interview
        </Button>
      </div>
    </form>
  );
}
