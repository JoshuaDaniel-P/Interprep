"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { StudioGlassEnvironment } from "@/components/layout/StudioGlassEnvironment";
import {
  Sparkles,
  Mail,
  Lock,
  UserCheck,
  AlertCircle,
  Info,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const [portalMode, setPortalMode] = useState<"candidate" | "admin">("candidate");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("admin@preppilot.ai");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (portalMode === "admin") {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        router.push("/admin");
      }, 400);
      return;
    }

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const result = await signUpWithEmail(name || "Candidate", email.trim(), password);
        router.push("/profile/setup");
      } else {
        const result = await signInWithEmail(email.trim(), password);
        if (result.role === "ADMIN") {
          router.push("/admin");
        } else if (result.isNewUser) {
          router.push("/profile/setup");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminQuickAccess = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/admin");
    }, 400);
  };

  const handleDemoAccess = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithEmail("candidate@preppilot.com", "candidate123");
      if (result.isNewUser) {
        router.push("/profile/setup");
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithGoogle();
      if (result.role === "ADMIN") {
        router.push("/admin");
      } else if (result.isNewUser) {
        router.push("/profile/setup");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Google Sign-In failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#D5D8DC]">
      {/* Studio Glass Environment */}
      <StudioGlassEnvironment />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="glass-icon-bubble w-12 h-12 text-blue-600 mx-auto shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            PrepPilot
          </h1>
          <p className="text-xs text-slate-600 uppercase tracking-wider font-extrabold">
            AI Interview Simulator & Evaluator
          </p>
        </div>

        {/* Portal Type Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 glass-capsule rounded-2xl border-white/95 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setPortalMode("candidate");
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              portalMode === "candidate"
                ? "bg-white/95 text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Candidate Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode("admin");
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              portalMode === "admin"
                ? "bg-white/95 text-amber-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Administrator Portal</span>
          </button>
        </div>

        {/* Form Liquid Glass Card */}
        <div
          className="glass-primary p-7 sm:p-8 space-y-5 rounded-[32px] border-white/95"
          data-config='{"refraction": 0.22, "edgeHighlight": 0.85, "specular": 0.8, "zRadius": 20, "cornerRadius": 32}'
        >
          {portalMode === "candidate" ? (
            <>
              {/* Candidate Mode Header Tabs */}
              <div className="text-center pb-2">
                <div className="flex border-b border-slate-200/70 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs font-black transition-colors ${
                      !isSignUp
                        ? "text-blue-700 border-b-2 border-blue-600 font-black"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs font-black transition-colors ${
                      isSignUp
                        ? "text-blue-700 border-b-2 border-blue-600 font-black"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Create Account
                  </button>
                </div>
                <h2 className="text-base font-black text-slate-900 pt-1">
                  {isSignUp ? "Create Candidate Account" : "Candidate Sign In"}
                </h2>
              </div>

              {!isFirebaseConfigured && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5 shadow-xs">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-blue-950">Zero-Config Mode Active</p>
                    <p className="text-blue-800 leading-relaxed text-[11px]">
                      Sign in with any email, use Google, or click Quick Demo Access.
                    </p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white/90 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-900"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="candidate@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/90 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/90 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-900"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-button-primary w-full py-3 text-xs font-black gap-2 shadow-md"
                >
                  <span>
                    {isSubmitting
                      ? "Authenticating..."
                      : isSignUp
                      ? "Create Candidate Account & Start"
                      : "Sign In to Candidate Dashboard"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200/70"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Or Continue With
                </span>
                <div className="flex-grow border-t border-slate-200/70"></div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleLogin}
                className="glass-button-secondary w-full py-2.5 px-4 text-xs font-extrabold gap-3 text-slate-800"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Account</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDemoAccess}
                className="glass-button-secondary w-full py-2.5 px-4 text-xs font-bold gap-2 text-blue-700 bg-blue-50/50"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Quick Demo Candidate Access →</span>
              </button>
            </>
          ) : (
            <>
              {/* Administrator Mode */}
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  Administrator Portal
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  University, College Placement & Enterprise Cohort Management
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] font-medium">
                  Admin access is reserved for university faculty, institutional reviewers, and enterprise training managers to track student batches.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/90 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/90 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-slate-900"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-xs font-black rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Enter Admin Management Portal →</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleAdminQuickAccess}
                  className="w-full py-2.5 text-xs font-bold rounded-xl text-amber-900 border border-amber-300/80 bg-white/70 hover:bg-amber-50/80 transition-all flex items-center justify-center gap-2"
                >
                  <span>⚡ Quick Admin Access (1-Click)</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
