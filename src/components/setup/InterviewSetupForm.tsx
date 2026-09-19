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

    router.push("/interviews/session");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
      {/* 1. Target Role */}
      <div className="glass-primary p-7 sm:p-8 rounded-[30px] border-white/95">
        <SelectCardGroup
          label="1. Target Role"
          description="Select the specific engineering or business role you are preparing for."
          options={roleOptions}
          selectedValue={config.targetRole}
          onChange={(targetRole) => setConfig((prev) => ({ ...prev, targetRole }))}
          columns={3}
        />
      </div>

      {/* 2. Target Company & Experience Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-primary p-7 sm:p-8 rounded-[30px] border-white/95 space-y-5">
          <SelectCardGroup
            label="2. Company Type"
            description="Calibrates the interviewer's perspective and expectations."
            options={companyOptions}
            selectedValue={config.companyType}
            onChange={(companyType) => setConfig((prev) => ({ ...prev, companyType }))}
            columns={2}
          />

          <div className="pt-4 border-t border-slate-200/60">
            <label className="text-xs font-black text-slate-800 block mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Target Company Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Google, Amazon, Stripe, Razorpay..."
              value={config.company || ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, company: e.target.value }))}
              className="w-full p-3.5 text-xs text-slate-900 bg-white/90 border border-white/95 rounded-2xl focus:ring-2 focus:ring-blue-500 font-semibold shadow-xs"
              style={{ boxShadow: "inset 0 1.5px 2px rgba(0, 0, 0, 0.04)" }}
            />
          </div>
        </div>

        <div className="glass-primary p-7 sm:p-8 rounded-[30px] border-white/95">
          <SelectCardGroup
            label="3. Experience Level"
            description="Adjusts question depth and seniority expectations."
            options={experienceOptions}
            selectedValue={config.experienceLevel}
            onChange={(experienceLevel) => setConfig((prev) => ({ ...prev, experienceLevel }))}
            columns={2}
          />
        </div>
      </div>

      {/* 4. Interview Type & Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-primary p-7 sm:p-8 rounded-[30px] border-white/95">
          <SelectCardGroup
            label="4. Interview Focus"
            description="Select the focus area of this session."
            options={typeOptions}
            selectedValue={config.interviewType}
            onChange={(interviewType) => setConfig((prev) => ({ ...prev, interviewType }))}
            columns={2}
          />
        </div>

        <div className="glass-primary p-7 sm:p-8 rounded-[30px] border-white/95">
          <SelectCardGroup
            label="5. Interview Difficulty"
            description="Select how the AI interviewer adapts follow-up depth."
            options={difficultyOptions}
            selectedValue={config.difficulty}
            onChange={(difficulty) => setConfig((prev) => ({ ...prev, difficulty }))}
            columns={2}
          />
        </div>
      </div>

      {/* 6. Question Count & Interview Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-primary p-7 sm:p-8 rounded-[30px] border-white/95">
          <SelectCardGroup
            label="6. Question Count"
            description="Choose question length or auto-tune per stream."
            options={questionLengthOptions}
            selectedValue={config.questionCount || 0}
            onChange={(questionCount) => setConfig((prev) => ({ ...prev, questionCount }))}
            columns={2}
          />
        </div>

        <div className="glass-primary p-7 sm:p-8 rounded-[30px] border-white/95">
          <SelectCardGroup
            label="7. Interview Mode"
            description="Choose how you want to conduct the interview."
            options={modeOptions}
            selectedValue={config.mode}
            onChange={(mode) => setConfig((prev) => ({ ...prev, mode }))}
            columns={2}
          />
        </div>
      </div>

      {/* Summary Banner & Action */}
      <div className="glass-primary p-8 rounded-[32px] border-white/95 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/15 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">Summary Configuration</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
              {config.targetRole} • {config.company || config.companyType} • {config.difficulty} Difficulty • {config.mode} Mode
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isStarting}
          className="glass-button-primary px-9 py-4 text-sm font-black gap-3 w-full sm:w-auto shadow-lg shadow-blue-500/20 active:scale-[0.98]"
        >
          <PlayCircle className="w-5 h-5 text-white" />
          {isStarting ? "Initializing AI Session..." : "Start Realistic Interview"}
        </button>
      </div>
    </form>
  );
}
