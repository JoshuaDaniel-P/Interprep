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
import { PlayCircle, Sparkles, Building2, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const roleOptions: OptionItem<TargetRole>[] = [
  { value: "Software Engineer", label: "Software Engineer", description: "System design, full-stack & problem solving" },
  { value: "Software Developer", label: "Software Developer", description: "Application programming, data structures & APIs" },
  { value: "Frontend Developer", label: "Frontend Developer", description: "React, browser APIs, state & performance" },
  { value: "Backend Developer", label: "Backend Developer", description: "REST/GraphQL, microservices, databases & queues" },
  { value: "Data Scientist", label: "Data Scientist", description: "Machine learning, feature engineering & model evaluation" },
  { value: "Data Analyst", label: "Data Analyst", description: "SQL pipelines, analytics & business metrics" },
  { value: "UI Designer", label: "UI/UX Designer", description: "Design systems, user research, wireframes & WCAG" },
  { value: "Product Manager", label: "Product Manager", description: "Product discovery, execution & trade-offs" },
  { value: "College Lecturer", label: "College Lecturer", description: "Curriculum delivery, pedagogical clarity & concepts" },
  { value: "Marketing", label: "Marketing", description: "Growth funnels, campaigns & acquisition metrics" },
  { value: "Sales", label: "Sales", description: "Discovery calls, objection handling & closing" },
];

const companyOptions: OptionItem<CompanyType>[] = [
  { value: "Startup", label: "Startup", description: "Fast-moving, high autonomy & broad scope" },
  { value: "Product Company", label: "Product Company", description: "Product-led tech organization & quality bars" },
  { value: "Service Company", label: "Service Company", description: "Client deliverables, timelines & execution" },
  { value: "Consulting", label: "Consulting", description: "Strategic advisory, communication & business impact" },
  { value: "Fintech", label: "Fintech", description: "Financial systems, compliance & low-latency reliability" },
  { value: "Enterprise", label: "Enterprise", description: "Large-scale systems, cross-functional processes" },
];

const experienceOptions: OptionItem<ExperienceLevel>[] = [
  { value: "Student", label: "Student / Intern", description: "Academic & personal project foundations" },
  { value: "0–2 years", label: "0–2 years (Junior)", description: "Foundational industry contributions" },
  { value: "2–5 years", label: "2–5 years (Mid-Level)", description: "Independent contributor & architecture" },
  { value: "5+ years", label: "5+ years (Senior+)", description: "System ownership, mentorship & strategy" },
];

const typeOptions: OptionItem<InterviewType>[] = [
  { value: "Mixed", label: "Comprehensive Round", description: "Best overall practice: projects, technical & STAR questions" },
  { value: "Technical", label: "Technical & Architecture", description: "Engineering design, algorithms, databases & trade-offs" },
  { value: "Behavioral", label: "Behavioral & STAR", description: "Team conflict, ownership, failures & accomplishments" },
  { value: "HR", label: "HR & Culture Fit", description: "Career motivations, company alignment & goals" },
];

const modeOptions: OptionItem<InterviewMode>[] = [
  { value: "Text", label: "Text Interview", description: "Interactive real-time adaptive Q&A workspace" },
  { value: "Voice", label: "Voice Interview", description: "Browser Speech-to-Text & AI Voice Questions" },
];

const difficultyOptions: OptionItem<Difficulty>[] = [
  {
    value: "Easy",
    label: "Easy",
    description: "Fundamental questions with straightforward wording. Supportive tone.",
  },
  {
    value: "Medium",
    label: "Medium",
    description: "Mix of fundamental and practical questions. Realistic industry difficulty.",
  },
  {
    value: "Hard",
    label: "Hard",
    description: "Deeper technical questions, challenging follow-ups, and pressure testing.",
  },
  {
    value: "Adaptive",
    label: "Adaptive (Smart)",
    description: "Dynamically raises difficulty on strong answers and adjusts when needed.",
  },
];

const questionLengthOptions: OptionItem<number>[] = [
  { value: 0, label: "Stream Auto-Tuned", description: "Auto-tuned based on stream depth (4–6 Qs)" },
  { value: 3, label: "3 Questions (Quick)", description: "Fast mock interview session" },
  { value: 5, label: "5 Questions (Standard)", description: "Balanced standard evaluation" },
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
    difficulty: "Adaptive",
    questionCount: 0,
    targetQuestionsCount: 5,
  });

  const [isStarting, setIsStarting] = useState(false);

  // Sync with profile defaults if available
  useEffect(() => {
    if (profile?.targetGoal) {
      setConfig((prev) => ({
        ...prev,
        targetRole: (profile.targetGoal.targetRole as TargetRole) || prev.targetRole,
        companyType: (profile.targetGoal.targetCompanyType as CompanyType) || prev.companyType,
      }));
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);

    const finalConfig: InterviewConfig = {
      ...config,
      company: (config.company || "").trim() || config.companyType,
      targetQuestionsCount: config.questionCount || 5,
    };

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
            description="Select the specific engineering or business role you are preparing for."
            options={roleOptions}
            selectedValue={config.targetRole}
            onChange={(targetRole) => setConfig((prev) => ({ ...prev, targetRole }))}
            columns={3}
          />
        </CardContent>
      </Card>

      {/* 2. Target Company & Experience Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <SelectCardGroup
              label="2. Company Type"
              description="Calibrates the interviewer's perspective and expectations."
              options={companyOptions}
              selectedValue={config.companyType}
              onChange={(companyType) => setConfig((prev) => ({ ...prev, companyType }))}
              columns={2}
            />

            <div className="pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                Target Company Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Google, Amazon, Stripe, Razorpay..."
                value={config.company || ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, company: e.target.value }))}
                className="w-full p-2.5 text-xs text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <SelectCardGroup
              label="3. Experience Level"
              description="Adjusts question depth and seniority expectations."
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
              label="4. Interview Focus"
              description="Select the focus area of this session."
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
              label="5. Interview Difficulty"
              description="Select how the AI interviewer adapts follow-up depth."
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
              {config.targetRole} • {config.company || config.companyType} • {config.difficulty} Difficulty • {config.mode} Mode
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
