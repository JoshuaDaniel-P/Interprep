"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateProfile, TargetRoleTrack } from "@/types/candidate";
import { candidateService } from "@/services/candidate.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SelectCardGroup } from "@/components/setup/SelectCardGroup";
import { User, GraduationCap, Code, Rocket, Target, CheckCircle } from "lucide-react";

export function CandidateOnboardingForm() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Clean empty initial state
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<"Student" | "Graduate" | "Employed" | "Unemployed">("Student");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  // Education
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [strongSubjects, setStrongSubjects] = useState("");

  // Featured Project Details
  const [projectName, setProjectName] = useState("");
  const [projectTech, setProjectTech] = useState("");
  const [projectContribution, setProjectContribution] = useState("");
  const [projectChallenges, setProjectChallenges] = useState("");

  // Target Goal
  const [targetRole, setTargetRole] = useState<TargetRoleTrack>("Software Developer");
  const [difficulty, setDifficulty] = useState<"Comfortable" | "Realistic" | "Pressure">("Realistic");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const newProfile: CandidateProfile = {
      uid: "candidate-user-active",
      email: "user@preppilot.com",
      fullName: fullName.trim() || "Candidate",
      status,
      city: city.trim(),
      bio: bio.trim(),
      education: {
        highestQualification: "Bachelor's Degree",
        degree: degree.trim(),
        branch: "Computer Science",
        institution: institution.trim(),
        graduationYear: new Date().getFullYear(),
        cgpaOrPercentage: cgpa.trim(),
        strongSubjects: strongSubjects ? strongSubjects.split(",").map((s) => s.trim()) : [],
        weakSubjects: [],
      },
      skills: projectTech ? projectTech.split(",").map((tech, i) => ({
        id: `s-${i}`,
        name: tech.trim(),
        proficiency: "Intermediate",
        yearsOfExperience: 1,
      })) : [],
      projects: projectName.trim() ? [
        {
          id: `p-${Date.now()}`,
          name: projectName.trim(),
          problemStatement: projectChallenges.trim() || "Technical project implementation",
          technologies: projectTech ? projectTech.split(",").map((t) => t.trim()) : [],
          candidateContribution: projectContribution.trim(),
          teamSize: 1,
          challenges: projectChallenges.trim(),
          solution: "Implemented optimization and clean architecture.",
          results: "Successfully built and deployed.",
        },
      ] : [],
      experience: [],
      achievements: [],
      targetGoal: {
        targetRole,
        targetCompanyType: "Product Company",
        targetIndustry: "Technology",
        interviewType: "Behavioral",
        difficulty,
      },
      isOnboarded: true,
      readinessPercentage: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await candidateService.saveProfile(newProfile);
    setIsSaving(false);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
        {[
          { num: 1, label: "Personal", icon: User },
          { num: 2, label: "Education", icon: GraduationCap },
          { num: 3, label: "Projects & Skills", icon: Rocket },
          { num: 4, label: "Target Goal", icon: Target },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : isDone
                  ? "text-emerald-700"
                  : "text-slate-500"
              }`}
            >
              {isDone ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step 1: Personal Profile */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              1. Personal Profile & Background
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Current City</label>
                <input
                  type="text"
                  placeholder="e.g. New York, NY"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Current Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="Student">Student</option>
                <option value="Graduate">Graduate</option>
                <option value="Employed">Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Short Self-Introduction</label>
              <textarea
                rows={3}
                placeholder="Briefly describe your career focus and technical background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" onClick={() => setStep(2)}>Next: Education →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Education */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              2. Education & Academic Background
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Degree / Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. B.S. Computer Science"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">College / University</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CGPA / Percentage</label>
                <input
                  type="text"
                  placeholder="e.g. 3.8 / 4.0 or 85%"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Strong Subjects</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures, Web APIs, SQL"
                  value={strongSubjects}
                  onChange={(e) => setStrongSubjects(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button type="button" onClick={() => setStep(3)}>Next: Projects & Skills →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Projects */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-brand-600" />
              3. Featured Project (AI Question Generator Target)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-xs text-brand-700 bg-brand-50 p-3 rounded-xl border border-brand-200">
              💡 <strong>Personalized AI Interviewing</strong>: Enter your project details below so the AI interviewer asks role-specific questions tailored to your actual project.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Project Name</label>
              <input
                type="text"
                placeholder="e.g. Real-Time Payment API & Caching Layer"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Technologies Used</label>
              <input
                type="text"
                placeholder="e.g. Node.js, Redis, PostgreSQL, Docker"
                value={projectTech}
                onChange={(e) => setProjectTech(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Specific Contribution</label>
              <textarea
                rows={2}
                placeholder="Describe your exact responsibilities and feature implementations..."
                value={projectContribution}
                onChange={(e) => setProjectContribution(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Key Challenges & Bottlenecks Solved</label>
              <textarea
                rows={2}
                placeholder="What technical problem occurred and how did you solve it?"
                value={projectChallenges}
                onChange={(e) => setProjectChallenges(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <Button type="button" onClick={() => setStep(4)}>Next: Target Goal →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Target Goal */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-600" />
              4. Target Goal & Preparation Track
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <SelectCardGroup
              label="Select Your Target Role Track"
              options={[
                { value: "Software Developer", label: "Software Developer", description: "DSA, APIs, System Design & SQL" },
                { value: "Data Scientist", label: "Data Scientist", description: "Python, Pandas, ML Models & Statistics" },
                { value: "UI Designer", label: "UI Designer", description: "Figma, Design Systems & Accessibility" },
                { value: "Product Manager", label: "Product Manager", description: "PRDs, Metrics & Feature Prioritization" },
                { value: "College Lecturer", label: "College Lecturer", description: "Pedagogy, Curriculum & Oral Defense" },
              ]}
              selectedValue={targetRole}
              onChange={(targetRole) => setTargetRole(targetRole as any)}
              columns={2}
            />

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>← Back</Button>
              <Button type="submit" size="lg" isLoading={isSaving} className="px-8 gap-2">
                Save Profile & Launch Dashboard →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
