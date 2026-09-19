"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user) {
        // Not logged in -> redirect cleanly to login
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        } else {
          router.replace("/login");
        }
        return;
      }

      // Check if this route requires ADMIN privileges
      if (requiredRole === "ADMIN" && role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }
    }
  }, [mounted, user, role, isLoading, requiredRole, router]);

  // If unauthenticated after mounting, show transition state instead of blank screen
  if (mounted && !isLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#D5D8DC] p-4">
        <div className="glass-primary p-6 rounded-3xl flex items-center gap-3 border border-white/95 shadow-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Redirecting to Sign In...
          </span>
        </div>
      </div>
    );
  }

  // If candidate attempting to access admin route, suppress content while redirecting
  if (mounted && requiredRole === "ADMIN" && role !== "ADMIN") {
    return null;
  }

  // Render children consistently on server and initial client render to guarantee 100% hydration match
  return <>{children}</>;
}
