"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, UserPlus, CheckCircle, Lock } from "lucide-react";

export default function AdminPage() {
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [targetRole, setTargetRole] = useState("Software Developer");
  const [candidates, setCandidates] = useState([
    { id: "c-1", name: "Alex Candidate", email: "alex@example.com", targetRole: "Software Developer", status: "Active" },
    { id: "c-2", name: "Sarah Lin", email: "sarah@example.com", targetRole: "Data Scientist", status: "Active" },
  ]);

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateEmail || !candidateName) return;

    const newCandidate = {
      id: `c-${Date.now()}`,
      name: candidateName,
      email: candidateEmail,
      targetRole,
      status: "Active",
    };

    setCandidates([newCandidate, ...candidates]);
    setCandidateName("");
    setCandidateEmail("");
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-amber-600" />
              Admin Management Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create and manage candidate accounts for PrepPilot interview practice.
            </p>
          </div>
        </div>

        {/* Create Candidate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-600" />
              Create New Candidate Account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateCandidate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Smith"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Target Track</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Software Developer">Software Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="UI Designer">UI Designer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="College Lecturer">College Lecturer</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <Button type="submit" className="gap-2 px-6">
                  <UserPlus className="w-4 h-4" />
                  Add Candidate Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Existing Candidates List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Active Managed Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Candidate</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Target Track</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="py-4 px-6 font-bold text-slate-900">{c.name}</td>
                      <td className="py-4 px-6 text-slate-600">{c.email}</td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{c.targetRole}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
