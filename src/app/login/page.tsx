"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage("Please enter your ID / email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signInWithEmail(email.trim(), password);
      if (result.role === "ADMIN") {
        router.push("/admin");
      } else if (result.isNewUser) {
        router.push("/profile/setup");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Studio Refraction Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full bg-blue-200/25 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-[40rem] h-[40rem] rounded-full bg-indigo-100/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[45rem] h-[45rem] rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            PrepPilot
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-extrabold">
            AI Interview Simulator & Evaluator
          </p>
        </div>

        {/* Login Liquid Glass Panel */}
        <div
          className="glass liquid-glass-panel p-7 sm:p-8 space-y-5"
          data-config='{"refraction": 0.25, "edgeHighlight": 0.9, "specular": 0.8, "zRadius": 22, "cornerRadius": 32}'
        >
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Enter your credentials to access your interview workspace.
            </p>
          </div>

          {/* Exact Error Message Display */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                ID / Email Address
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
              className="glass liquid-glass-btn-primary w-full py-3 text-xs font-black gap-2 shadow-md"
              data-config='{"button": true, "zRadius": 14, "cornerRadius": 9999}'
            >
              <span>{isSubmitting ? "Authenticating..." : "Log in"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200/70"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Or Continue With
            </span>
            <div className="flex-grow border-t border-slate-200/70"></div>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
            className="glass liquid-glass-btn-secondary w-full py-2.5 px-4 text-xs font-extrabold gap-3 text-slate-800"
            data-config='{"button": true, "zRadius": 12, "cornerRadius": 9999}'
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
            <span>Continue with Google</span>
          </button>

          {/* Create Account Link */}
          <div className="pt-2 text-center border-t border-slate-200/60">
            <p className="text-xs text-slate-500 font-semibold">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-black text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
