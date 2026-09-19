"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { candidateService } from "@/services/candidate.service";
import { CandidateProfile, TargetRoleTrack } from "@/types/candidate";
import {
  qualificationOptions,
  degreeOptions,
  specializationOptions,
  categorizedSkills,
} from "@/data/options/profileOptions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SelectCardGroup } from "@/components/setup/SelectCardGroup";
import {
  User,
  GraduationCap,
  Code,
  Rocket,
  Briefcase,
  Target,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";

export function ProfileSetupWizard() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Personal
  const [fullName, setFullName] = useState("");
  const [ageGroup, setAgeGroup] = useState("22-25");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState("English");
  const [status, setStatus] = useState<"Student" | "Graduate" | "Employed" | "Unemployed">("Student");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (user?.displayName && !fullName) {
      setFullName(user.displayName);
    }
  }, [user]);

  // Step 2: Education
  const [highestQualification, setHighestQualification] = useState("Undergraduate");
  const [degree, setDegree] = useState("B.Tech");
  const [branchCategory, setBranchCategory] = useState("Engineering");
  const [branch, setBranch] = useState("Computer Science");
  const [institution, setInstitution] = useState(""); // MANUAL TEXT INPUT
  const [graduationYear, setGraduationYear] = useState(2026);
  const [cgpa, setCgpa] = useState("");
  const [strongSubjects, setStrongSubjects] = useState("");
  const [weakSubjects, setWeakSubjects] = useState("");

  // Step 3: Skills & Courses
  const [selectedSkillNames, setSelectedSkillNames] = useState<string[]>(["JavaScript", "Node.js", "SQL"]);
  const [skillDetails, setSkillDetails] = useState<Record<string, { proficiency: "Beginner" | "Intermediate" | "Advanced"; confidence: number }>>({
    JavaScript: { proficiency: "Intermediate", confidence: 8 },
    "Node.js": { proficiency: "Intermediate", confidence: 7 },
    SQL: { proficiency: "Beginner", confidence: 5 },
  });

  // Step 4: Projects
  const [projects, setProjects] = useState([
    {
      name: "",
      problemStatement: "",
      technologies: "",
      contribution: "",
      challenges: "",
      solution: "",
      results: "",
      demoUrl: "",
    },
  ]);

  // Step 5: Experience & Achievements
  const [experienceOrg, setExperienceOrg] = useState("");
  const [experienceRole, setExperienceRole] = useState("");
  const [achievements, setAchievements] = useState("");

  // Step 6: Target Goal
  const [targetRole, setTargetRole] = useState<TargetRoleTrack>("Software Developer");
  const [targetCompanyType, setTargetCompanyType] = useState("Product Company");
  const [difficulty, setDifficulty] = useState<"Comfortable" | "Realistic" | "Pressure">("Realistic");

  const handleToggleSkill = (skillName: string) => {
    if (selectedSkillNames.includes(skillName)) {
      setSelectedSkillNames(selectedSkillNames.filter((s) => s !== skillName));
    } else {
      setSelectedSkillNames([...selectedSkillNames, skillName]);
      setSkillDetails({
        ...skillDetails,
        [skillName]: { proficiency: "Intermediate", confidence: 7 },
      });
    }
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        name: "",
        problemStatement: "",
        technologies: "",
        contribution: "",
        challenges: "",
        solution: "",
        results: "",
        demoUrl: "",
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const activeUid = user?.uid || "candidate-user-active";

    const formattedSkills = selectedSkillNames.map((name, i) => ({
      id: `s-${i}`,
      name,
      proficiency: skillDetails[name]?.proficiency || "Intermediate",
      yearsOfExperience: 1,
      confidence: skillDetails[name]?.confidence || 7,
    }));

    const formattedProjects = projects
      .filter((p) => p.name.trim())
      .map((p, i) => ({
        id: `p-${i}`,
        name: p.name.trim(),
        problemStatement: p.problemStatement.trim() || "Technical challenge",
        technologies: p.technologies ? p.technologies.split(",").map((t) => t.trim()) : [],
        candidateContribution: p.contribution.trim(),
        teamSize: 3,
        challenges: p.challenges.trim(),
        solution: p.solution.trim(),
        results: p.results.trim(),
        demoUrl: p.demoUrl.trim(),
      }));

    const newProfile: CandidateProfile = {
      uid: activeUid,
      email: user?.email || "candidate@preppilot.com",
      fullName: fullName.trim() || "Candidate",
      ageGroup,
      city: city.trim(),
      languages: languages.split(",").map((l) => l.trim()),
      status,
      bio: bio.trim(),
      education: {
        highestQualification,
        degree,
        branch,
        institution: institution.trim(), // Manual college input
        graduationYear: Number(graduationYear),
        cgpaOrPercentage: cgpa.trim(),
        strongSubjects: strongSubjects ? strongSubjects.split(",").map((s) => s.trim()) : [],
        weakSubjects: weakSubjects ? weakSubjects.split(",").map((s) => s.trim()) : [],
      },
      skills: formattedSkills,
      projects: formattedProjects,
      experience: experienceOrg.trim()
        ? [
            {
              id: "exp-1",
              organization: experienceOrg.trim(),
              position: experienceRole.trim() || "Intern",
              durationMonths: 6,
              responsibilities: "Key technical contributions and deliverables.",
              technologiesUsed: [],
            },
          ]
        : [],
      achievements: achievements ? achievements.split("\n").map((a) => a.trim()).filter(Boolean) : [],
      targetGoal: {
        targetRole,
        targetCompanyType,
        targetIndustry: "Technology",
        interviewType: "Behavioral",
        difficulty,
      },
      isOnboarded: true,
      readinessPercentage: 68,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await candidateService.saveProfile(newProfile);
    await refreshProfile();
    setIsSaving(false);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Step Indicator Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card flex items-center justify-between overflow-x-auto gap-2">
        {[
          { num: 1, label: "Personal", icon: User },
          { num: 2, label: "Education", icon: GraduationCap },
          { num: 3, label: "Skills", icon: Code },
          { num: 4, label: "Projects", icon: Rocket },
          { num: 5, label: "Experience", icon: Briefcase },
          { num: 6, label: "Target Goal", icon: Target },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-brand-50 text-brand-700 border border-brand-200 shadow-xs"
                  : isDone
                  ? "text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {isDone ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
              )}
              <span>{s.label}</span>
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
              Step 1: Personal Profile & Background
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Age Group</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  <option value="18-21">18 – 21 years</option>
                  <option value="22-25">22 – 25 years</option>
                  <option value="26-30">26 – 30 years</option>
                  <option value="30+">30+ years</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Current City</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Current Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Student">Student</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Short Self-Introduction</label>
              <textarea
                rows={3}
                placeholder="Briefly state your technical passion, career focus, and strengths..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl"
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
              Step 2: Education (Structured Dropdowns & College Manual Input)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Highest Qualification</label>
                <select
                  value={highestQualification}
                  onChange={(e) => setHighestQualification(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  {qualificationOptions.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Degree</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  {degreeOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Branch / Specialization</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  {(specializationOptions[branchCategory] || specializationOptions.Engineering).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* MANUAL TEXT INPUT FOR COLLEGE / UNIVERSITY NAME */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                College / University Name <span className="text-brand-600 font-normal">(Manual Text Input)</span>
              </label>
              <input
                type="text"
                placeholder="Type your full college or university name..."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Graduation Year</label>
                <input
                  type="number"
                  placeholder="2026"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Weak / Target Subjects</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems, System Design"
                  value={weakSubjects}
                  onChange={(e) => setWeakSubjects(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button type="button" onClick={() => setStep(3)}>Next: Skills →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Categorized Skills */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-brand-600" />
              Step 3: Technical Skills & Training
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-xs text-slate-500">
              Select the skills and courses you have learned. PrepPilot uses these to identify skill gaps against your target role.
            </p>

            {Object.entries(categorizedSkills).map(([category, skillList]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skillList.map((skillName) => {
                    const isSelected = selectedSkillNames.includes(skillName);
                    return (
                      <button
                        key={skillName}
                        type="button"
                        onClick={() => handleToggleSkill(skillName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected ? `✓ ${skillName}` : `+ ${skillName}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <Button type="button" onClick={() => setStep(4)}>Next: Featured Projects →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Projects (Manual Details) */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-brand-600" />
              Step 4: Featured Projects (Feeds AI Interview Questions)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-950 font-medium leading-relaxed">
              💡 <strong>How PrepPilot Uses This</strong>: Your AI interviewer will inspect these specific project details (e.g. <em>&ldquo;Why did you choose Redis over PostgreSQL for your API project?&rdquo;</em>).
            </div>

            {projects.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Project #{idx + 1}
                  </span>
                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                      className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Real-Time Payment API & Caching Layer"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].name = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Technologies Used</label>
                    <input
                      type="text"
                      placeholder="e.g. Node.js, Redis, PostgreSQL, Docker"
                      value={p.technologies}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].technologies = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Exact Contribution</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what you specifically built or optimized..."
                    value={p.contribution}
                    onChange={(e) => {
                      const updated = [...projects];
                      updated[idx].contribution = e.target.value;
                      setProjects(updated);
                    }}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Technical Challenges & Solutions</label>
                  <textarea
                    rows={2}
                    placeholder="Describe a key bottleneck (e.g. 450ms DB query latency) and how you solved it..."
                    value={p.challenges}
                    onChange={(e) => {
                      const updated = [...projects];
                      updated[idx].challenges = e.target.value;
                      setProjects(updated);
                    }}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={handleAddProject} className="gap-1.5 text-xs">
              <Plus className="w-4 h-4" /> Add Another Project
            </Button>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>← Back</Button>
              <Button type="button" onClick={() => setStep(5)}>Next: Experience →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Experience & Achievements */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              Step 5: Experience & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Organization / Company</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Tech Solutions"
                  value={experienceOrg}
                  onChange={(e) => setExperienceOrg(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Position / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering Intern"
                  value={experienceRole}
                  onChange={(e) => setExperienceRole(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Achievements & Competitions</label>
              <textarea
                rows={3}
                placeholder="List hackathons, awards, scholarships, or leadership roles (one per line)..."
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(4)}>← Back</Button>
              <Button type="button" onClick={() => setStep(6)}>Next: Target Goal →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Target Goal */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-600" />
              Step 6: Target Goal & Preparation Track
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
              <Button type="button" variant="outline" onClick={() => setStep(5)}>← Back</Button>
              <Button type="submit" size="lg" isLoading={isSaving} className="px-8 gap-2">
                Save Candidate Profile & Launch Dashboard →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
