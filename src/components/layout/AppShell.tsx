"use client";

import React, { useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { LiquidGlassProvider } from "@/components/ui/LiquidGlassProvider";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileNav } from "./MobileNav";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <LiquidGlassProvider>
      <div className="min-h-screen flex font-sans antialiased text-slate-900 transition-colors duration-300 relative bg-[#f8fafc] overflow-x-hidden">
        {/* Subtle White Studio Background Environment with Restrained Refraction Highlights */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
          <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-[40rem] h-[40rem] rounded-full bg-indigo-100/30 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 w-[45rem] h-[45rem] rounded-full bg-slate-200/40 blur-3xl" />
        </div>

        {/* Desktop Sidebar */}
        <div className="relative z-10 hidden md:block">
          <AppSidebar />
        </div>

        {/* Mobile Navigation Drawer & Floating Bottom Capsule */}
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col min-w-0 relative z-10">
          <AppHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </LiquidGlassProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppShellContent>{children}</AppShellContent>
    </ThemeProvider>
  );
}
