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
import {
  PlayCircle,
  Sparkles,
  Building2,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Sliders,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ---------------------------------------------------------------------------
// Step 1: 10 Supported Role Disciplines
// ---------------------------------------------------------------------------
const roleOptions: OptionItem<TargetRole>[] = [
  { value: "Software Engineer", label: "Software Engineer", description: "System design, full-stack & problem solving" },
  { value: "Software Developer", label: "Software Developer", description: "Application programming, data structures & APIs" },
  { value: "Frontend Developer", label: "Frontend Developer", description: "React, browser APIs, state & performance" },
  { value: "Backend Developer", label: "Backend Developer", description: "REST/GraphQL, microservices, databases & queues" },
  { value: "DevOps & Cloud Engineer", label: "DevOps & Cloud Engineer", description: "CI/CD, Kubernetes, Docker, Terraform & cloud infrastructure" },
  { value: "Data Scientist", label: "Data Scientist", description: "Machine learning, feature engineering & model evaluation" },
  { value: "Data Analyst", label: "Data Analyst", description: "SQL pipelines, analytics & business metrics" },
  { value: "Embedded Systems Engineer", label: "Embedded & IoT Engineer", description: "Microcontrollers, RTOS, firmware, C/C++ & hardware protocols" },
  { value: "Mechanical Design Engineer", label: "Mechanical Design Engineer", description: "CAD/CAM, FEA simulation, GD&T, thermodynamics & DFMA" },
  { value: "Civil & Structural Engineer", label: "Civil & Structural Engineer", description: "RCC design, structural analysis, geotechnical & site execution" },
  { value: "UI Designer", label: "UI/UX Designer", description: "Design systems, user research, wireframes & WCAG" },
  { value: "College Lecturer", label: "College Lecturer", description: "Curriculum delivery, pedagogical clarity & academic concepts" },
  { value: "Product Manager", label: "Product Manager", description: "Product discovery, execution & trade-offs" },
  { value: "Marketing", label: "Marketing", description: "Growth funnels, campaigns & acquisition metrics" },
  { value: "Sales", label: "Sales", description: "Discovery calls, objection handling & closing" },
];

// ---------------------------------------------------------------------------
// Step 2: Role-Specific Organization Types
// ---------------------------------------------------------------------------
function getOrganizationOptions(role: TargetRole): {
  label: string;
  description: string;
  options: OptionItem<CompanyType>[];
  inputLabel: string;
  inputPlaceholder: string;
} {
  if (role === "College Lecturer") {
    return {
      label: "2. Institution Type",
      description: "Select the academic institution environment you are interviewing for.",
      options: [
        {
          value: "Autonomous Engineering College",
          label: "Engineering College",
          description: "Teaching-focused curriculum delivery, labs & student mentoring",
        },
        {
          value: "Tier-1 Research Institute (IIT/NIT/BITS)",
          label: "Research Institute (IIT/NIT)",
          description: "Theoretical depth, publications, sponsored research & PhD guidance",
        },
        {
          value: "State / Central University",
          label: "State / Central University",
          description: "Department syllabus, academic committees & university examinations",
        },
        {
          value: "Polytechnic / Community College",
          label: "Polytechnic / College",
          description: "Vocational education, foundational concepts & practical labs",
        },
        {
          value: "EdTech Academy",
          label: "EdTech & Higher Ed Academy",
          description: "Live bootcamp lectures, doubt clearing & curriculum creation",
        },
      ],
      inputLabel: "Target College / University Name (Optional)",
      inputPlaceholder: "e.g., IIT Bombay, NIT Trichy, BITS Pilani, Anna University, Stanford...",
    };
  }

  if (role === "UI Designer") {
    return {
      label: "2. Design Environment / Studio",
      description: "Select the design organization style that matches your target role.",
      options: [
        {
          value: "Design Agency / Studio",
          label: "Design Agency / Studio",
          description: "Client variety, rapid creative sprints & brand identity",
        },
        {
          value: "Product Company",
          label: "Tech Product Company",
          description: "Design systems, user research, product growth & prototyping",
        },
        {
          value: "Enterprise",
          label: "Enterprise SaaS",
          description: "Complex workflows, data density, accessibility (WCAG) at scale",
        },
        {
          value: "Startup",
          label: "Early-Stage Startup",
          description: "End-to-end 0-to-1 design, full ownership of user experience",
        },
      ],
      inputLabel: "Target Company / Design Studio (Optional)",
      inputPlaceholder: "e.g., Figma, Airbnb, Razorpay, CRED, Pentagram...",
    };
  }

  if (role === "Data Scientist" || role === "Data Analyst") {
    return {
      label: "2. Industry & Data Environment",
      description: "Select the data infrastructure and problem domain.",
      options: [
        {
          value: "Product Company",
          label: "AI & Tech Product",
          description: "Recommender models, LLM systems, A/B testing & experimentation",
        },
        {
          value: "Fintech",
          label: "Fintech & Banking",
          description: "Fraud detection, credit risk models & low-latency analytics",
        },
        {
          value: "Consulting",
          label: "Consulting & Analytics Agency",
          description: "Client business intelligence, KPI dashboards & SQL models",
        },
        {
          value: "Enterprise",
          label: "Enterprise & Cloud Data",
          description: "Petabyte-scale data lakes, ETL pipelines & governance",
        },
      ],
      inputLabel: "Target Company / Firm (Optional)",
      inputPlaceholder: "e.g., Meta, Snowflake, Fractal Analytics, Mu Sigma, Stripe...",
    };
  }

  if (role === "Product Manager") {
    return {
      label: "2. Business Model & Stage",
      description: "Select the product archetype you are targeting.",
      options: [
        {
          value: "B2B SaaS",
          label: "B2B SaaS",
          description: "Enterprise sales cycles, customer retention, roadmap prioritization",
        },
        {
          value: "Product Company",
          label: "B2C Consumer Tech",
          description: "Viral loops, mobile engagement, acquisition funnels & monetization",
        },
        {
          value: "Startup",
          label: "Early-Stage Venture",
          description: "0-to-1 discovery, rapid MVP validation & product-market fit",
        },
        {
          value: "Enterprise",
          label: "Enterprise Marketplace",
          description: "Multi-sided networks, scale, regulation & ecosystem operations",
        },
      ],
      inputLabel: "Target Company Name (Optional)",
      inputPlaceholder: "e.g., Atlassian, Uber, Swiggy, Notion, Airbnb...",
    };
  }

  if (role === "Marketing" || role === "Sales") {
    return {
      label: "2. Sales / Growth Segment",
      description: "Select the go-to-market motion you will be interviewed on.",
      options: [
        {
          value: "B2B SaaS",
          label: "B2B Enterprise SaaS",
          description: "Multi-stakeholder deals, enterprise lead qualification & MEDDIC",
        },
        {
          value: "Startup",
          label: "High-Growth D2C",
          description: "Paid performance marketing, viral social loops & ROAS",
        },
        {
          value: "Consulting",
          label: "Growth Marketing Agency",
          description: "Client campaigns, multi-channel strategy & attribution",
        },
        {
          value: "Enterprise",
          label: "Corporate Accounts",
          description: "Large enterprise renewals, channel partners & procurement",
        },
      ],
      inputLabel: "Target Company / Brand (Optional)",
      inputPlaceholder: "e.g., Salesforce, HubSpot, Zomato, Zoho...",
    };
  }

  if (role === "Embedded Systems Engineer") {
    return {
      label: "2. Hardware / Embedded Domain",
      description: "Select the embedded hardware environment you are preparing for.",
      options: [
        {
          value: "Startup",
          label: "Automotive & EV Electronics",
          description: "Embedded ECUs, CAN bus, battery management systems & AUTOSAR",
        },
        {
          value: "Product Company",
          label: "Semiconductor & Silicon Firm",
          description: "Microcontroller firmware, silicon validation, peripheral drivers & RTOS",
        },
        {
          value: "Enterprise",
          label: "Robotics & Industrial Automation",
          description: "Motor control, industrial PLCs, real-time sensing & ROS integration",
        },
        {
          value: "Consulting",
          label: "Consumer IoT & Wearables",
          description: "Ultra-low power BLE firmware, battery optimization & edge sensing",
        },
      ],
      inputLabel: "Target Hardware / Semiconductor OEM (Optional)",
      inputPlaceholder: "e.g., Bosch, Texas Instruments, Qualcomm, Tesla, Intel, Ather...",
    };
  }

  if (role === "Mechanical Design Engineer") {
    return {
      label: "2. Mechanical Industry / Manufacturing Domain",
      description: "Select the engineering industry matching your design focus.",
      options: [
        {
          value: "Product Company",
          label: "Automotive & Mobility OEM",
          description: "Chassis, powertrain, crashworthiness, sheet metal & EV packaging",
        },
        {
          value: "Enterprise",
          label: "Heavy Equipment & Machinery",
          description: "Hydraulic systems, heavy structural fabrication & FEA validation",
        },
        {
          value: "Startup",
          label: "Precision Hardware & Consumer Electronics",
          description: "Precision plastic injection molding, GD&T, thermal enclosures & DFMA",
        },
        {
          value: "Consulting",
          label: "Aerospace & Turbomachinery",
          description: "High-temperature alloys, CFD aerodynamic simulation & propulsion",
        },
      ],
      inputLabel: "Target Engineering / Manufacturing OEM (Optional)",
      inputPlaceholder: "e.g., Boeing, Tata Motors, L&T, Caterpillar, Apple Hardware, ISRO...",
    };
  }

  if (role === "Civil & Structural Engineer") {
    return {
      label: "2. Structural / Construction Environment",
      description: "Select the construction and structural design sector.",
      options: [
        {
          value: "Consulting",
          label: "Structural Design Consultancy",
          description: "High-rise RCC/steel design, STAAD/ETABS analysis & IS/ACI code compliance",
        },
        {
          value: "Enterprise",
          label: "Infrastructure & EPC Contractor",
          description: "Metros, highways, bridges, heavy civil site execution & project control",
        },
        {
          value: "Product Company",
          label: "Geotechnical & Deep Foundations",
          description: "Soil mechanics, piling, deep excavation shoring & soil stabilization",
        },
        {
          value: "Startup",
          label: "Real Estate & Urban Development",
          description: "Commercial complexes, residential structural framing & BIM coordination",
        },
      ],
      inputLabel: "Target Structural Consultancy / EPC Contractor (Optional)",
      inputPlaceholder: "e.g., L&T Construction, Arup, WSP, AECOM, Shapoorji Pallonji...",
    };
  }

  if (role === "DevOps & Cloud Engineer") {
    return {
      label: "2. Cloud & Infrastructure Architecture",
      description: "Select the infrastructure scale and cloud deployment style.",
      options: [
        {
          value: "Product Company",
          label: "Cloud-Native SaaS & Hyper-Scale",
          description: "Kubernetes clusters, multi-region high availability & distributed microservices",
        },
        {
          value: "Enterprise",
          label: "Enterprise IT & Financial Cloud",
          description: "Strict zero-trust networking, PCI-DSS compliance & automated CI/CD gates",
        },
        {
          value: "Startup",
          label: "Fast-Paced Startup Infrastructure",
          description: "Rapid developer velocity, GitOps ArgoCD, Docker & Terraform from 0-to-1",
        },
        {
          value: "Consulting",
          label: "Cloud Consultancy & Migration",
          description: "On-prem to AWS/Azure migrations, FinOps cost optimization & observability",
        },
      ],
      inputLabel: "Target Cloud / Tech Organization (Optional)",
      inputPlaceholder: "e.g., AWS, Microsoft, Netflix, Datadog, Stripe, Cloudflare...",
    };
  }

  // Default: Software Engineering / Developer / Tech roles
  return {
    label: "2. Company Type",
    description: "Calibrates the interviewer's perspective and architecture standards.",
    options: [
      {
        value: "Product Company",
        label: "Product Tech Company",
        description: "Product-led tech organization, high engineering quality bars",
      },
      {
        value: "Startup",
        label: "Tech Startup",
        description: "Fast-moving, high autonomy & broad feature ownership",
      },
      {
        value: "Service Company",
        label: "IT Services (TCS/Wipro/Infosys)",
        description: "Client deliverables, timelines, enterprise frameworks",
      },
      {
        value: "Fintech",
        label: "Fintech & Payments",
        description: "High-throughput APIs, transaction consistency & security",
      },
      {
        value: "Enterprise",
        label: "Enterprise Tech",
        description: "Large-scale distributed systems, multi-team architecture",
      },
      {
        value: "Consulting",
        label: "Technology Consulting",
        description: "Client advisory, architectural evaluations & modernizations",
      },
    ],
    inputLabel: "Target Company Name (Optional)",
    inputPlaceholder: "e.g., Google, Amazon, Microsoft, Uber, Razorpay...",
  };
}

// ---------------------------------------------------------------------------
// Step 2: Role-Specific Experience Options
// ---------------------------------------------------------------------------
function getExperienceOptions(role: TargetRole): OptionItem<ExperienceLevel>[] {
  if (role === "College Lecturer") {
    return [
      {
        value: "Student",
        label: "Post-Graduate / Scholar",
        description: "M.Tech / M.Sc / PhD scholars entering academic teaching",
      },
      {
        value: "0–2 years",
        label: "Assistant Professor (0–2 yrs)",
        description: "Foundational classroom teaching, lab setup & evaluations",
      },
      {
        value: "2–5 years",
        label: "Senior Faculty (2–5 yrs)",
        description: "Curriculum development, student mentoring & research papers",
      },
      {
        value: "5+ years",
        label: "Professor / Dept Head (5+ yrs)",
        description: "Academic governance, NAAC/NBA accreditation & departmental leadership",
      },
    ];
  }

  return [
    { value: "Student", label: "Student / Intern", description: "Academic & personal project foundations" },
    { value: "0–2 years", label: "0–2 years (Junior)", description: "Foundational industry contributions & debugging" },
    { value: "2–5 years", label: "2–5 years (Mid-Level)", description: "Independent contributor & system design" },
    { value: "5+ years", label: "5+ years (Senior+)", description: "System ownership, technical leadership & strategy" },
  ];
}

// ---------------------------------------------------------------------------
// Step 3: Role-Specific Round Focus Options
// ---------------------------------------------------------------------------
function getInterviewTypeOptions(role: TargetRole): OptionItem<InterviewType>[] {
  if (role === "College Lecturer") {
    return [
      {
        value: "Mixed",
        label: "Comprehensive Faculty Round",
        description: "Teaching demo, subject mastery & classroom pedagogy scenarios",
      },
      {
        value: "Technical",
        label: "Subject Matter Mastery",
        description: "Core academic concepts, lab experiments & theoretical depth",
      },
      {
        value: "Behavioral",
        label: "Pedagogy & Student Handling",
        description: "Engaging diverse students, resolving conflicts & ethical grading",
      },
      {
        value: "HR",
        label: "Selection Board & Institute Fit",
        description: "Department responsibilities, research ambitions & institutional vision",
      },
    ];
  }

  return [
    {
      value: "Mixed",
      label: "Comprehensive Round",
      description: "Best overall practice: projects, technical depth & STAR behavioral",
    },
    {
      value: "Technical",
      label: "Technical & Problem Solving",
      description: "Domain fundamentals, system architecture, data models & trade-offs",
    },
    {
      value: "Behavioral",
      label: "Behavioral & STAR",
      description: "Cross-functional collaboration, ownership, failures & accomplishments",
    },
    {
      value: "HR",
      label: "HR & Culture Alignment",
      description: "Career motivations, company values alignment & long-term goals",
    },
  ];
}

const difficultyOptions: OptionItem<Difficulty>[] = [
  {
    value: "Easy",
    label: "Easy",
    description: "Fundamental questions with straightforward wording. Supportive tone.",
  },
  {
    value: "Medium",
    label: "Medium",
    description: "Mix of foundational and practical scenarios. Realistic industry standard.",
  },
  {
    value: "Hard",
    label: "Hard",
    description: "Deep technical questions, edge-case probing & pressure testing.",
  },
  {
    value: "Adaptive",
    label: "Adaptive (Smart)",
    description: "Dynamically raises difficulty on strong answers and adapts in real-time.",
  },
];

const questionLengthOptions: OptionItem<number>[] = [
  { value: 0, label: "Stream Auto-Tuned", description: "Auto-tuned per stream depth (4–6 Qs)" },
  { value: 3, label: "3 Questions (Quick)", description: "Fast mock interview session" },
  { value: 5, label: "5 Questions (Standard)", description: "Balanced standard evaluation" },
  { value: 7, label: "7 Questions (Deep Dive)", description: "Comprehensive full interview test" },
];

const modeOptions: OptionItem<InterviewMode>[] = [
  {
    value: "Voice",
    label: "Voice Interview (Recommended)",
    description: "Speech-to-Text & Indian English (en-IN) AI Voice Questions",
  },
  {
    value: "Text",
    label: "Text Interview",
    description: "Interactive real-time adaptive Q&A keyboard workspace",
  },
];

export function InterviewSetupForm() {
  const router = useRouter();
  const { profile } = useAuth();

  // Progressive Wizard Step: 1 -> 2 -> 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [config, setConfig] = useState<InterviewConfig>({
    targetRole: "Software Engineer",
    companyType: "Product Company",
    company: "",
    jobDescription: "",
    experienceLevel: "2–5 years",
    interviewType: "Mixed",
    mode: "Voice",
    difficulty: "Adaptive",
    questionCount: 0,
    targetQuestionsCount: 5,
  });

  const [isStarting, setIsStarting] = useState(false);

  // Sync with user profile on initial load
  useEffect(() => {
    if (profile?.targetGoal) {
      const defaultRole = (profile.targetGoal.targetRole as TargetRole) || "Software Engineer";
      setConfig((prev) => ({
        ...prev,
        targetRole: defaultRole,
        companyType: (profile.targetGoal.targetCompanyType as CompanyType) || prev.companyType,
      }));
    }
  }, [profile]);

  // When Role changes, auto-set domain-appropriate organization type default
  const handleRoleChange = (newRole: TargetRole) => {
    const orgData = getOrganizationOptions(newRole);
    const defaultOrg = orgData.options[0]?.value || "Product Company";

    setConfig((prev) => ({
      ...prev,
      targetRole: newRole,
      companyType: defaultOrg,
      company: "", // clear previous company so user can enter appropriate target
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);

    const orgData = getOrganizationOptions(config.targetRole);
    const companyName = (config.company || "").trim() || config.companyType;

    const finalConfig: InterviewConfig = {
      ...config,
      company: companyName,
      targetQuestionsCount: config.questionCount || 5,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("preppilot_active_config", JSON.stringify(finalConfig));
    }

    router.push("/interview");
  };

  const orgConfig = getOrganizationOptions(config.targetRole);
  const expOptions = getExperienceOptions(config.targetRole);
  const typeOptions = getInterviewTypeOptions(config.targetRole);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Visual Stepper Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 Tab */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
              currentStep === 1
                ? "bg-brand-50 border border-brand-300 text-brand-950 font-bold"
                : currentStep > 1
                ? "bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
                : "text-slate-400"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep > 1
                  ? "bg-emerald-600 text-white"
                  : currentStep === 1
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider block text-slate-500">Step 1</span>
              <span className="text-xs sm:text-sm truncate block font-bold">Target Role</span>
            </div>
          </button>

          {/* Step 2 Tab */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
              currentStep === 2
                ? "bg-brand-50 border border-brand-300 text-brand-950 font-bold"
                : currentStep > 2
                ? "bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold"
                : "text-slate-400"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep > 2
                  ? "bg-emerald-600 text-white"
                  : currentStep === 2
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider block text-slate-500">Step 2</span>
              <span className="text-xs sm:text-sm truncate block font-bold">
                {config.targetRole === "College Lecturer" ? "Institution & Level" : "Company & Seniority"}
              </span>
            </div>
          </button>

          {/* Step 3 Tab */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
              currentStep === 3
                ? "bg-brand-50 border border-brand-300 text-brand-950 font-bold"
                : "text-slate-400"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 3
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider block text-slate-500">Step 3</span>
              <span className="text-xs sm:text-sm truncate block font-bold">Round & Voice Mode</span>
            </div>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* STEP 1: ROLE SELECTION */}
      {/* =================================================================== */}
      {currentStep === 1 && (
        <Card className="border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
                  Step 1 of 3: Discipline
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  Select Your Target Role or Profession
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  The subsequent interview environment, institution types, and evaluation questions will adapt specifically to this domain.
                </p>
              </div>
            </div>

            <SelectCardGroup
              label="Available Role Tracks"
              description="Choose the stream you want to prepare for:"
              options={roleOptions}
              selectedValue={config.targetRole}
              onChange={handleRoleChange}
              columns={3}
            />

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Selected: <span className="font-bold text-brand-700">{config.targetRole}</span>
              </div>
              <Button
                type="button"
                size="lg"
                onClick={handleNext}
                className="gap-2 px-6 bg-brand-600 hover:bg-brand-700 text-white"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =================================================================== */}
      {/* STEP 2: ROLE-AWARE ORGANIZATION TYPE & EXPERIENCE LEVEL */}
      {/* =================================================================== */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-brand-200 text-brand-700">
                {config.targetRole === "College Lecturer" ? (
                  <GraduationCap className="w-5 h-5" />
                ) : (
                  <Briefcase className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block">
                  Configuring Context For
                </span>
                <span className="text-sm font-bold text-slate-900">{config.targetRole}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-brand-700 hover:underline font-semibold"
            >
              Change Role
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization / Institution Type */}
            <Card className="border-slate-200">
              <CardContent className="p-6 space-y-4">
                <SelectCardGroup
                  label={orgConfig.label}
                  description={orgConfig.description}
                  options={orgConfig.options}
                  selectedValue={config.companyType}
                  onChange={(companyType) => setConfig((prev) => ({ ...prev, companyType }))}
                  columns={1}
                />

                <div className="pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {orgConfig.inputLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={orgConfig.inputPlaceholder}
                    value={config.company || ""}
                    onChange={(e) => setConfig((prev) => ({ ...prev, company: e.target.value }))}
                    className="w-full p-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    If left blank, questions will frame scenarios around your selected institution type.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Seniority / Experience Level */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <SelectCardGroup
                  label="Seniority & Experience Level"
                  description="Adjusts question complexity and seniority expectations."
                  options={expOptions}
                  selectedValue={config.experienceLevel}
                  onChange={(experienceLevel) => setConfig((prev) => ({ ...prev, experienceLevel }))}
                  columns={1}
                />
              </CardContent>
            </Card>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="gap-2 border-slate-300 text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Roles</span>
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={handleNext}
              className="gap-2 px-6 bg-brand-600 hover:bg-brand-700 text-white"
            >
              <span>Continue to Step 3</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 3: ROUND FOCUS, DIFFICULTY, QUESTION COUNT & VOICE MODE */}
      {/* =================================================================== */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interview Focus Round */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <SelectCardGroup
                  label="3. Interview Focus Round"
                  description="Select which aspect of competency to simulate in this session."
                  options={typeOptions}
                  selectedValue={config.interviewType}
                  onChange={(interviewType) => setConfig((prev) => ({ ...prev, interviewType }))}
                  columns={1}
                />
              </CardContent>
            </Card>

            {/* Difficulty Level */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <SelectCardGroup
                  label="4. Interview Difficulty"
                  description="Controls how aggressively follow-ups probe for edge cases."
                  options={difficultyOptions}
                  selectedValue={config.difficulty}
                  onChange={(difficulty) => setConfig((prev) => ({ ...prev, difficulty }))}
                  columns={2}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Question Length */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <SelectCardGroup
                  label="5. Session Question Count"
                  description="Set session length or let the stream auto-tune questions."
                  options={questionLengthOptions}
                  selectedValue={config.questionCount || 0}
                  onChange={(questionCount) => setConfig((prev) => ({ ...prev, questionCount }))}
                  columns={2}
                />
              </CardContent>
            </Card>

            {/* Mode Selection */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <SelectCardGroup
                  label="6. Interview Interaction Mode"
                  description="Select how you want to speak and respond during the session."
                  options={modeOptions}
                  selectedValue={config.mode}
                  onChange={(mode) => setConfig((prev) => ({ ...prev, mode }))}
                  columns={1}
                />
              </CardContent>
            </Card>
          </div>

          {/* Final Summary Card & Launch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block">
                  Ready to Simulate
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {config.targetRole} • {config.company || config.companyType}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {config.experienceLevel} • {config.difficulty} Difficulty • {config.mode} Mode
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="w-1/2 sm:w-auto gap-2 border-slate-300 text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button
                type="submit"
                size="lg"
                isLoading={isStarting}
                className="w-1/2 sm:w-auto px-8 gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Start Interview</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
