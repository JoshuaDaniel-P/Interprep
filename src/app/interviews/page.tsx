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
        <div className="space-y-10 sm:space-y-12 lg:space-y-14 pb-16">
          {/* Header */}
          <div className="glass-primary p-8 sm:p-12 rounded-[36px] flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-white/95 animate-section-stagger-1">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 glass-capsule px-4 py-1.5 text-xs font-black text-blue-700 border-white/95 shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Adaptive AI Simulator
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Interview Simulations
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 leading-relaxed">
                Configure customized mock interview sessions calibrated for <strong className="text-slate-900 font-bold">{targetRole}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/interviews/history"
                className="glass-button-secondary px-6 py-3 text-xs sm:text-sm font-black gap-2.5 inline-flex items-center shadow-md active:scale-[0.98]"
              >
                <History className="w-4 h-4 text-slate-500" />
                Past Sessions
              </Link>
              <Link
                href="/interviews/setup"
                className="glass-button-primary px-7 py-3 text-xs sm:text-sm font-black gap-2.5 inline-flex items-center shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                <PlayCircle className="w-4 h-4 text-white" />
                Start Interview
              </Link>
            </div>
          </div>

          {/* Quick Start Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 animate-section-stagger-2">
            {quickModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.title}
                  className="glass-primary p-7 sm:p-8 rounded-[30px] flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group border-white/95"
                  data-config='{"refraction": 0.2, "edgeHighlight": 0.85, "specular": 0.8, "zRadius": 18, "cornerRadius": 30}'
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-capsule border-white/95 shadow-xs text-blue-600">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="glass-capsule px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 border-white/80">
                        {mode.tag}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {mode.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={mode.href}
                      className="w-full glass-button-secondary py-3 text-xs sm:text-sm font-black justify-center gap-2 flex items-center shadow-sm active:scale-[0.98]"
                    >
                      Configure & Start
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent History Table */}
          <div className="space-y-4 animate-section-stagger-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Recent Practice Attempts
              </h2>
              <Link
                href="/interviews/history"
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
              >
                View all history
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="glass-primary p-12 text-center text-slate-500 rounded-[28px] border-white/95">
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
