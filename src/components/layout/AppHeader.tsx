"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { PlayCircle, Menu } from "lucide-react";

interface AppHeaderProps {
  user: UserProfile;
  onOpenMobileNav?: () => void;
}

export function AppHeader({ user, onOpenMobileNav }: AppHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Mobile nav toggle button */}
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="hidden sm:block">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Current Target
          </span>
          <p className="text-sm font-semibold text-gray-900">{user.targetRole}</p>
        </div>
      </div>

      {/* Right side: Quick Action & Profile */}
      <div className="flex items-center gap-4">
        <Link href="/setup">
          <Button size="sm" className="gap-2">
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Start New Interview</span>
            <span className="sm:hidden">Start</span>
          </Button>
        </Link>

        {/* User profile badge - clickable to view profile */}
        <Link
          href="/profile"
          className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:opacity-85 transition-opacity group"
          title="View & Edit Profile"
        >
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200 group-hover:border-brand-400 transition-colors">
            {user.name ? user.name.charAt(0).toUpperCase() : "C"}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-gray-900 leading-none group-hover:text-brand-600 transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 max-w-[160px] truncate">{user.email}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
