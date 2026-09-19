"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable";
import { interviewService } from "@/services/interview.service";
import { InterviewSession } from "@/types/interview";
import { useAuth } from "@/context/AuthContext";
import { PlayCircle, Sparkles, ArrowRight, History, Zap, Shield, Code } from "lucide-react";

export default function InterviewsPage() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const targetRole = profile?.targetGoal?.targetRole || "Software Developer";

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      try {
        const list = await interviewService.getRecentInterviews(user?.uid);
        setSessions(list);
      } catch (err) {
        console.warn("Error loading interviews:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, [user?.uid]);

  const quickModes = [
    {
      title: "Comprehensive Mock Round",
      desc: "Full evaluation covering project architecture, coding depth, and STAR behavioral answers.",
      icon: Zap,
      tag: "Recommended",
      href: "/interviews/setup",
    },
    {
      title: "Technical & System Design",
      desc: "Deep-dive questions on data structures, distributed systems, APIs, and performance trade-offs.",
      icon: Code,
      tag: "Technical Depth",
      href: "/interviews/setup",
    },
    {
      title: "STAR Behavioral & Leadership",
      desc: "Real-world scenarios on cross-functional conflict, ownership, and measurable business impact.",
      icon: Shield,
      tag: "Culture & Fit",
      href: "/interviews/setup",
    },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-black text-blue-700 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive AI Simulator
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Interview Simulations
              </h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">
                Configure customized mock interview sessions calibrated for {targetRole}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/interviews/history"
                className="liquid-glass-btn-secondary px-4 py-2.5 text-xs font-bold gap-2 inline-flex items-center"
              >
                <History className="w-4 h-4 text-slate-500" />
                Past Sessions
              </Link>
              <Link
                href="/interviews/setup"
                className="liquid-glass-btn-primary px-5 py-2.5 text-xs font-bold gap-2 inline-flex items-center"
              >
                <PlayCircle className="w-4 h-4" />
                Start Interview
              </Link>
            </div>
          </div>

          {/* Quick Start Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quickModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.title}
                  className="glass liquid-glass-panel p-6 flex flex-col justify-between hover:shadow-xl transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {mode.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 pt-1">
                      {mode.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={mode.href}
                      className="w-full liquid-glass-btn-secondary py-2 text-xs font-bold justify-center gap-1.5 flex items-center"
                    >
                      Configure & Start
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Practice Attempts
              </h2>
              <Link
                href="/interviews/history"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-500 bg-white/70 rounded-2xl border border-white">
                Loading recent attempts...
              </div>
            ) : (
              <RecentInterviewsTable sessions={sessions} />
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
