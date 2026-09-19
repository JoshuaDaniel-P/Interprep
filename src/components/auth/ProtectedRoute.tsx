"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, profile, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in -> go to login
        router.push("/login");
        return;
      }

      // Check if this route requires ADMIN privileges
      if (requiredRole === "ADMIN" && role !== "ADMIN") {
        // Normal candidates cannot access admin routes
        router.push("/dashboard");
        return;
      }
    }
  }, [user, profile, role, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="glass liquid-glass-panel p-8 text-center space-y-3 max-w-sm w-full" data-config='{"refraction": 0.25, "edgeHighlight": 0.9, "specular": 0.8, "zRadius": 20, "cornerRadius": 28}'>
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto shadow-sm" />
          <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole === "ADMIN" && role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
