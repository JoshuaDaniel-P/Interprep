"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, UserPlus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ManagedCandidate {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();

  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Software Developer");

  const [candidates, setCandidates] = useState<ManagedCandidate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load existing candidates
  useEffect(() => {
    async function fetchCandidates() {
      setIsLoadingList(true);
      try {
        const res = await fetch("/api/admin/list-candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminEmail: user?.email }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.candidates)) {
            setCandidates(data.candidates);
          }
        }
      } catch (err) {
        console.warn("Failed to load candidates list:", err);
      } finally {
        setIsLoadingList(false);
      }
    }

    if (user?.email) {
      fetchCandidates();
    }
  }, [user?.email]);

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const name = candidateName.trim();
    const email = candidateEmail.trim();
    const password = tempPassword.trim();

    if (!name || !email || !password) {
      setFeedback({ type: "error", message: "All fields are required." });
      return;
    }

    if (password.length < 6) {
      setFeedback({ type: "error", message: "Temporary password must be at least 6 characters." });
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/create-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          targetRole,
          adminEmail: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create candidate account.");
      }

      setFeedback({
        type: "success",
        message: `Candidate account created for ${name} (${email}). Candidate can now log in with their temporary credentials.`,
      });

      // Add to list
      const newCandidate: ManagedCandidate = {
        id: data.candidate?.uid || `c-${Date.now()}`,
        name,
        email,
        targetRole,
        status: "Active",
        createdAt: new Date().toISOString(),
      };
      setCandidates((prev) => [newCandidate, ...prev]);

      // Reset form
      setCandidateName("");
      setCandidateEmail("");
      setTempPassword("");
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to create candidate." });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AppShell>
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
          {/* Header Panel */}
          <div className="glass-primary p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="glass-capsule px-3.5 py-1 text-xs font-black text-blue-800 gap-2 inline-flex items-center shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Administrative Access Only
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Admin Management Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
                Create and manage candidate accounts for PrepPilot realistic AI mock interviews.
              </p>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 shadow-xs border ${
                feedback.type === "success"
                  ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                  : "bg-rose-50/90 border-rose-200 text-rose-900"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Create Candidate Card */}
          <div className="glass-secondary p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/50">
              <div className="glass-icon-bubble w-8 h-8 text-blue-600">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Create Candidate Account
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Account is provisioned with normal candidate privileges (no admin access).
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCandidate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Smith"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white/90 border border-white/95 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Candidate Email / User ID
                </label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white/90 border border-white/95 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Temporary Password
                </label>
                <input
                  type="password"
                  placeholder="min 6 chars"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white/90 border border-white/95 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  Assigned Target Track
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white/90 border border-white/95 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 shadow-xs"
                >
                  <option value="Software Developer">Software Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="glass-button-primary px-6 py-2.5 text-xs font-black gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <UserPlus className="w-4 h-4 text-white" />}
                  <span>{isCreating ? "Provisioning Candidate..." : "Create Candidate Account"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Candidates List */}
          <div className="glass-secondary p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Managed Candidate Accounts
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  All candidate accounts registered or provisioned in PrepPilot.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-white/60 px-3 py-1 rounded-full border border-white">
                {candidates.length} Candidate{candidates.length === 1 ? "" : "s"}
              </span>
            </div>

            {isLoadingList ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Loading candidate accounts...
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">
                No candidates registered yet. Use the form above to provision a candidate account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/70 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Target Track</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50 text-xs font-semibold">
                    {candidates.map((c) => (
                      <tr key={c.id} className="hover:bg-white/40 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-slate-900">{c.name}</td>
                        <td className="py-3 px-4 text-slate-600">{c.email}</td>
                        <td className="py-3 px-4 text-blue-700 font-bold">{c.targetRole}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
