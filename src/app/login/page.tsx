"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, Mail, Lock, UserCheck, AlertCircle, Info, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loginAsDemoCandidate } = useAuth();

  const [portalMode, setPortalMode] = useState<"candidate" | "admin">("candidate");
  const [isSignUp, setIsSignUp] = useState(false);
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

    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        router.push("/profile/setup");
      } else {
        await signInWithEmail(email, password);
        router.push("/dashboard");
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

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage("Google Sign-In failed. Try Candidate Quick Access.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsSubmitting(true);
    await loginAsDemoCandidate();
    setIsSubmitting(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-600 items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            PrepPilot
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
            AI Co-pilot for Interview Preparation
          </p>
        </div>

        {/* Portal Type Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setPortalMode("candidate");
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              portalMode === "candidate"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-brand-600" />
            <span>Candidate Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode("admin");
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              portalMode === "admin"
                ? "bg-white text-amber-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Administrator Portal</span>
          </button>
        </div>

        {/* Form Card */}
        <Card className="shadow-card border-slate-200">
          {portalMode === "candidate" ? (
            <>
              <CardHeader className="text-center pb-2">
                <div className="flex border-b border-slate-100 mb-2">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setErrorMessage(null); }}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${
                      !isSignUp ? "text-brand-700 border-b-2 border-brand-600 font-bold" : "text-slate-400"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setErrorMessage(null); }}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${
                      isSignUp ? "text-brand-700 border-b-2 border-brand-600 font-bold" : "text-slate-400"
                    }`}
                  >
                    Create Account
                  </button>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 pt-2">
                  {isSignUp ? "Create Candidate Account" : "Candidate Sign In"}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {!isFirebaseConfigured && (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-blue-900">Zero-Config Mode Active</p>
                      <p className="text-blue-700 leading-relaxed">
                        Database credentials are not required. Sign in with any email, use Google, or click Quick Demo Access.
                      </p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        placeholder="candidate@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full font-bold shadow-xs"
                  >
                    {isSignUp ? "Create Candidate Account & Start" : "Sign In to Candidate Dashboard"}
                  </Button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase">
                    Or Continue With
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  isLoading={isSubmitting}
                  onClick={handleGoogleLogin}
                  className="w-full gap-3 font-semibold text-slate-800"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  Google Account
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleDemoAccess}
                  className="w-full gap-2 text-xs font-semibold"
                >
                  <UserCheck className="w-4 h-4 text-brand-600" />
                  Quick Demo Candidate Access →
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Administrator Portal
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  University, College Placement & Enterprise Cohort Management
                </p>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Admin access is reserved for university faculty, institutional reviewers, and enterprise training managers to track student batches.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Administrator Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Admin Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full font-bold shadow-xs bg-amber-700 hover:bg-amber-800 text-white"
                  >
                    Enter Admin Management Portal →
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={isSubmitting}
                    onClick={handleAdminQuickAccess}
                    className="w-full text-xs font-bold text-amber-900 border-amber-300 hover:bg-amber-50"
                  >
                    ⚡ Quick Admin Access (1-Click)
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
