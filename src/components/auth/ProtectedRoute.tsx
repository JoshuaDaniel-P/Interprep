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
        // Not logged in -> redirect to login cleanly
        router.replace("/login");
        return;
      }

      // Check if this route requires ADMIN privileges
      if (requiredRole === "ADMIN" && role !== "ADMIN") {
        // Normal candidates cannot access admin routes
        router.replace("/dashboard");
        return;
      }
    }
  }, [user, profile, role, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          className="glass liquid-glass-panel p-8 text-center space-y-3 max-w-sm w-full shadow-lg"
          data-config='{"refraction": 0.25, "edgeHighlight": 0.9, "specular": 0.8, "zRadius": 20, "cornerRadius": 28}'
          style={{
            padding: "2rem",
            textAlign: "center",
            maxWidth: "24rem",
            width: "100%",
            borderRadius: "1.5rem",
            background: "rgba(255, 255, 255, 0.88)",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
          }}
        >
          <div
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto shadow-xs"
            style={{
              width: "2rem",
              height: "2rem",
              border: "3px solid #2563eb",
              borderTopColor: "transparent",
              borderRadius: "9999px",
              margin: "0 auto 0.75rem",
            }}
          />
          <p
            className="text-xs font-black text-slate-800 uppercase tracking-wider"
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "#1e293b",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <p className="text-xs font-bold text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  if (requiredRole === "ADMIN" && role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
