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
        // Not logged in -> redirect cleanly
        router.replace("/login");
        return;
      }

      // Check if this route requires ADMIN privileges
      if (requiredRole === "ADMIN" && role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }
    }
  }, [mounted, user, role, isLoading, requiredRole, router]);

  // If unauthenticated after mounting, suppress content while redirecting
  if (mounted && !isLoading && !user) {
    return null;
  }

  // If candidate attempting to access admin route, suppress content while redirecting
  if (mounted && requiredRole === "ADMIN" && role !== "ADMIN") {
    return null;
  }

  // Render children consistently on server and initial client render to guarantee 100% hydration match
  return <>{children}</>;
}
