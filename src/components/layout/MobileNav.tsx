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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  const mobileNavItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Interviews", href: "/interviews", icon: PlayCircle },
    { name: "Performance", href: "/performance", icon: TrendingUp },
    { name: "History", href: "/interviews/history", icon: Sparkles },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* Floating Liquid Glass Bottom Navigation Capsule (APK First-Class Experience) */}
      <div className="liquid-glass-mobile-nav">
        {mobileNavItems.map((item) => {
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
                "flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200",
                isActive
                  ? "bg-white text-blue-600 shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-black mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Slide-out Drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-4/5 max-w-xs liquid-glass-panel h-full shadow-2xl flex flex-col z-10 bg-white/90">
            <div className="p-5 flex items-center justify-between border-b border-white/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900">PrepPilot</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {mobileNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold transition-all",
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-700 hover:bg-slate-100/70"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
