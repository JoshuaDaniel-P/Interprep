"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Search, Bell, ChevronRight, Menu, User, LogOut, ShieldCheck } from "lucide-react";

interface AppHeaderProps {
  onOpenMobileNav?: () => void;
}

export function AppHeader({ onOpenMobileNav }: AppHeaderProps) {
  const router = useRouter();
  const { user, profile, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Compute actual authenticated display details (no hardcoded Alex)
  const displayName =
    profile?.fullName?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const displayEmail = profile?.email || user?.email || "candidate@preppilot.com";
  const initials = (displayName.charAt(0) || "C").toUpperCase();
  const targetRole = profile?.targetGoal?.targetRole || "Software Developer";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/login");
  };

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutsideNotif(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideNotif);
    return () => document.removeEventListener("mousedown", handleClickOutsideNotif);
  }, []);

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-300 backdrop-blur-md bg-white/20 border-b border-white/50">
      {/* Mobile Nav Menu Button */}
      {onOpenMobileNav && (
        <button
          onClick={onOpenMobileNav}
          className="p-2 rounded-full text-slate-600 hover:bg-white/50 md:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Left Center: Pill Search Bar */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mr-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search mock interviews, technical topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full glass-capsule border-white/95 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner backdrop-blur-md"
          />
        </div>
      </div>

      {/* Right Controls: Bell, User Identity Capsule & Menu, Target Role */}
      <div className="flex items-center gap-3.5 ml-auto">
        {/* Bell Icon in Liquid Circle with Interactive Notification Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="glass-icon-bubble text-slate-600 hover:text-blue-600 transition-colors relative cursor-pointer pointer-events-auto"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500 shadow-xs" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 glass-primary rounded-[24px] p-5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 border-white/95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <span className="text-xs font-black text-slate-900">Notifications</span>
                <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="py-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center mx-auto border border-blue-400/20">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-slate-800">You are all caught up!</p>
                <p className="text-[11px] text-slate-500 font-medium">New interview evaluations and gap insights will appear here.</p>
              </div>
            </div>
          )}
        </div>

        {/* Current Target Pill Card (Candidate Only - Clickable to Setup) */}
        {role !== "ADMIN" && (
          <Link
            href="/interviews/setup"
            className="hidden sm:flex items-center gap-2.5 px-4 py-2 glass-capsule hover:bg-white border-white/95 shadow-xs backdrop-blur-md transition-all cursor-pointer group"
            title="Click to customize interview target"
          >
            <span className="text-[12px] group-hover:scale-110 transition-transform">🎯</span>
            <div className="text-left">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block leading-none">
                Target Role
              </span>
              <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mt-0.5 max-w-[130px] truncate">
                {targetRole}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        )}

        {/* Interactive Candidate Identity & Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-full glass-capsule hover:bg-white/90 transition-all focus:outline-none cursor-pointer pointer-events-auto"
            aria-expanded={menuOpen}
            aria-label="User account menu"
          >
            {/* Liquid Glass Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-black flex items-center justify-center text-xs shadow-sm">
              {initials}
            </div>

            <div className="hidden lg:block text-left pr-2">
              <p className="text-xs font-black text-slate-900 leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold leading-tight max-w-[140px] truncate">
                {displayEmail}
              </p>
            </div>
          </button>

          {/* Liquid Glass Account Dropdown Menu */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-3 w-72 glass-primary rounded-[24px] p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 border-white/95"
            >
              {/* Profile Summary Header */}
              <div className="p-3 border-b border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {displayEmail}
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {role === "ADMIN" ? "Administrator" : targetRole}
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-2 space-y-1">
                {role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-50/80 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Admin Portal
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-white/80 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile & Experience
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50/80 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
