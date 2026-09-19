"use client";

import React from "react";

interface LiquidGlassProviderProps {
  children: React.ReactNode;
}

export function LiquidGlassProvider({ children }: LiquidGlassProviderProps) {
  return (
    <div className="liquid-glass-root relative w-full min-h-screen">
      {children}
    </div>
  );
}
