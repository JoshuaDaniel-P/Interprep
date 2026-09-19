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
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Performance", href: "/performance", icon: TrendingUp },
  { name: "History", href: "/interviews/history", icon: Sparkles },
  { name: "Profile", href: "/profile", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex flex-col h-screen fixed inset-y-0 left-0 z-50 hidden md:flex transition-all duration-300 pointer-events-auto select-none bg-white/20 backdrop-blur-md border-r border-white/60">
      {/* Brand Header */}
      <div className="h-20 px-7 flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 border border-white/80 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            PrepPilot
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-5 space-y-2">
        <nav className="space-y-2.5">
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
                  "flex items-center gap-3.5 px-4 py-3 rounded-full text-xs font-black transition-all duration-200 cursor-pointer pointer-events-auto relative z-10",
                  isActive
                    ? "glass-capsule text-slate-950 shadow-md shadow-blue-500/10 border-white/95 bg-white/75"
                    : "text-slate-600 hover:text-slate-950 hover:bg-white/50"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    isActive
                      ? "bg-blue-500/20 text-blue-600 border border-blue-400/30"
                      : "text-slate-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding & Liquid Badge */}
      <div className="p-6 space-y-5">
        <div className="space-y-0.5 text-slate-400 text-[11px] font-semibold leading-tight px-1">
          <p>Better</p>
          <p>Interviews</p>
          <p>A Brighter</p>
          <p className="text-slate-600 font-extrabold">You</p>
          <p className="pt-1 text-slate-300 tracking-widest">— —</p>
        </div>

        {/* PrepPilot v1.0.0 Liquid Glass Capsule Badge */}
        <div className="glass-capsule p-3 flex items-center gap-3 rounded-2xl shadow-xs border-white/95">
          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 shrink-0 border border-blue-400/30">
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
