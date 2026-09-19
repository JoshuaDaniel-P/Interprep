"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  PlayCircle,
  TrendingUp,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const sidebarNavigation: NavigationItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Interviews", href: "/interviews", icon: PlayCircle },
  { name: "Performance", href: "/performance", icon: TrendingUp },
  { name: "History", href: "/interviews/history", icon: Sparkles },
  { name: "Profile", href: "/profile", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex flex-col h-screen fixed inset-y-0 left-0 z-50 hidden md:flex transition-all duration-300 pointer-events-auto select-none">
      {/* Brand Header */}
      <div className="h-20 px-8 flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            PrepPilot
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-6 space-y-2">
        <nav className="space-y-2">
          {sidebarNavigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer pointer-events-auto relative z-10",
                  isActive
                    ? "bg-white/80 text-blue-600 border border-white shadow-md shadow-blue-500/10 backdrop-blur-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding & Liquid Badge (Matching Mockup) */}
      <div className="p-6 space-y-6">
        <div className="space-y-0.5 text-slate-400 text-xs font-semibold leading-tight px-2">
          <p>Better</p>
          <p>Interviews</p>
          <p>A Brighter</p>
          <p className="text-slate-500 font-bold">You</p>
          <p className="pt-1 text-slate-300">— —</p>
        </div>

        {/* PrepPilot v1.0.0 Liquid Glass Capsule Badge */}
        <div className="p-3 mockup-glass-card flex items-center gap-2.5 rounded-2xl bg-white/70 shadow-sm border-white">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-900 leading-none">PrepPilot</p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
