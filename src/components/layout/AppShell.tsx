"use client";

import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/context/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, profile } = useAuth();

  const displayName =
    profile?.fullName?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const displayEmail = profile?.email?.trim() || user?.email || "";
  const targetRole = profile?.targetGoal?.targetRole || "Software Developer";

  const activeUser = {
    id: user?.uid || profile?.uid || "candidate-user",
    name: displayName,
    email: displayEmail,
    targetRole: targetRole,
    avatarUrl: user?.photoURL || "",
    joinedDate: profile?.createdAt || "2026-01-01",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 antialiased">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AppHeader
          user={activeUser}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
