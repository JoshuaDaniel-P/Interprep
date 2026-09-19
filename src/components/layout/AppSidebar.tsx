"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlayCircle,
  History,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mainNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Practice Interview", href: "/setup", icon: PlayCircle },
  { name: "Preparation Roadmaps", href: "/courses", icon: BookOpen },
  { name: "History", href: "/history", icon: History },
];

const secondaryNavigation: NavigationItem[] = [
  { name: "Onboarding Profile", href: "/onboarding", icon: UserCheck },
  { name: "Admin Portal", href: "/admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed inset-y-0 left-0 z-30 hidden md:flex">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
            PrepPilot
          </span>
          <span className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">
            AI Interview Co-pilot
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          <nav className="space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    isActive
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-brand-600" : "text-slate-400"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Management
          </div>
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    isActive
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-brand-600" : "text-slate-400"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
          <p className="font-bold text-slate-900">Offline-First Engine</p>
          <p className="mt-0.5 text-slate-500 text-[11px]">Firestore Persistence Active</p>
        </div>
      </div>
    </aside>
  );
}
