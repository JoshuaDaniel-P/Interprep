"use client";

import React, { useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { LiquidGlassProvider } from "@/components/ui/LiquidGlassProvider";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { StudioGlassEnvironment } from "./StudioGlassEnvironment";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <LiquidGlassProvider>
      <div className="min-h-screen flex font-sans antialiased text-slate-900 transition-colors duration-300 relative bg-[#D5D8DC] overflow-x-hidden">
        {/* Light Grey Studio Environment with Layered Floating Clear Liquid Glass Geometry */}
        <StudioGlassEnvironment />

        {/* Desktop Sidebar */}
        <div className="relative z-50 hidden md:block w-64 shrink-0">
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
          <main className="flex-1 px-6 sm:px-10 lg:px-12 xl:pr-36 2xl:pr-48 py-8 sm:py-12 max-w-[1360px] w-full mr-auto animate-page-entrance">
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
