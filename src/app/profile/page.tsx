"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  GraduationCap,
  Code,
  Rocket,
  Target,
  LogOut,
  Edit,
  Award,
  CheckCircle,
  FileText,
  Upload,
  Trash2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [resumeName, setResumeName] = useState<string>("Alex_FullStack_Resume_2026.pdf");
  const [resumeUploadedAt, setResumeUploadedAt] = useState<string>("September 15, 2026");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setResumeName(file.name);
        setResumeUploadedAt(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
        setIsUploading(false);
      }, 500);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.push("/login");
  };

  const activeProfile = {
    fullName: profile?.fullName || user?.displayName || user?.email?.split("@")[0] || "Candidate",
    email: profile?.email || user?.email || "",
    city: profile?.city || "Not specified",
    status: profile?.status || "Student",
    bio: profile?.bio || "Candidate preparing for realistic AI mock interviews.",
    readinessPercentage: profile?.readinessPercentage || 20,
    targetGoal: profile?.targetGoal || {
      targetRole: "Software Developer",
      difficulty: "Realistic",
    },
    education: profile?.education || {
      degree: "Not specified",
      institution: "Not specified",
      graduationYear: new Date().getFullYear(),
      cgpaOrPercentage: "",
    },
    skills: profile?.skills || [],
    projects: profile?.projects || [],
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-2xl border border-brand-200 shrink-0">
                {activeProfile.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {activeProfile.fullName}
                  </h1>
                  <Badge variant="brand" size="sm">
                    {activeProfile.targetGoal?.targetRole || "Software Developer"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{activeProfile.email}</p>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{activeProfile.city} • {activeProfile.status}</p>
              </div>
            </div>

            {/* Preparation Score Dial */}
            <div className="text-center sm:text-right bg-brand-50/60 border border-brand-200 rounded-2xl p-4 min-w-[160px]">
              <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">
                Readiness Score
              </span>
              <div className="text-3xl font-black text-brand-900 mt-0.5">
                {activeProfile.readinessPercentage || 68}%
              </div>
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center justify-between">
            <Link href="/profile/setup">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" /> Edit Profile & Target Goal
              </Button>
            </Link>

            <Button
              variant="danger"
              size="sm"
              isLoading={isLoggingOut}
              onClick={handleLogout}
              className="gap-2 px-4 font-bold"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </Button>
          </div>

          {/* Hidden File Input for Resume */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleResumeUpload}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />

          {/* Resume & CV Management Card */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                Resume & Portfolio File
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-bold"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
              >
                <Upload className="w-3.5 h-3.5" />
                Replace Resume
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 border border-rose-200">
                    PDF
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {resumeName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Uploaded on {resumeUploadedAt} • Extracted 3 skills & 1 project
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => alert(`Viewing ${resumeName}`)}
                  >
                    View File
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-600 hover:bg-rose-50 p-2"
                    onClick={() => {
                      setResumeName("No resume attached");
                      setResumeUploadedAt("Pending upload");
                    }}
                    title="Remove Resume"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                Education Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-2 text-xs text-slate-700">
              <p>
                <strong className="text-slate-900">Degree:</strong> {activeProfile.education?.degree || "Not specified"}
              </p>
              <p>
                <strong className="text-slate-900">Institution / University:</strong> {activeProfile.education?.institution || "Not specified"}
              </p>
              <p>
                <strong className="text-slate-900">Graduation Year:</strong> {activeProfile.education?.graduationYear || 2026}
              </p>
              <p>
                <strong className="text-slate-900">CGPA / Percentage:</strong> {activeProfile.education?.cgpaOrPercentage || "N/A"}
              </p>
            </CardContent>
          </Card>

          {/* Technical Skills */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-brand-600" />
                Technical Skills & Proficiency
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="flex flex-wrap gap-2">
                {activeProfile.skills?.map((s: any, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    {s.name} <span className="text-brand-700 font-normal">({s.proficiency || "Intermediate"})</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Featured Projects */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-brand-600" />
                Featured Projects (AI Questions Source)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              {activeProfile.projects?.map((p: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                  <p className="text-slate-600">
                    <strong className="text-slate-900">Technologies:</strong> {Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies}
                  </p>
                  <p className="text-slate-600">
                    <strong className="text-slate-900">Bottlenecks & Solution:</strong> {p.challenges}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
