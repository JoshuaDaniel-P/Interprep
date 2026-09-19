"use client";

import React, { useEffect, useRef } from "react";
import type { LiquidGlass as LiquidGlassInstance, GlassConfig } from "@ybouane/liquidglass";

interface LiquidGlassProviderProps {
  children: React.ReactNode;
}

export function LiquidGlassProvider({ children }: LiquidGlassProviderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: LiquidGlassInstance | null = null;
    let isMounted = true;

    async function initGlassEngine() {
      if (typeof window === "undefined" || !rootRef.current) return;

      try {

        // Dynamically import @ybouane/liquidglass browser module
        const { LiquidGlass } = await import("@ybouane/liquidglass");

        if (!isMounted || !rootRef.current) return;

        // Query all glass target elements
        const glassElements = rootRef.current.querySelectorAll<HTMLElement>(".glass, .glass-panel, .glass-capsule, .glass-button");

        if (glassElements.length === 0) return;

        // Physical Inflated Clear Glass defaults
        const defaults: Partial<GlassConfig> = {
          blurAmount: 0.12,      // Crystal clarity, transparent body
          refraction: 0.24,      // Real optical refraction
          chromAberration: 0.06, // Edge dispersion
          edgeHighlight: 0.85,   // Specular rim light
          specular: 0.75,        // Blinn-Phong reflection
          fresnel: 0.55,         // Grazing angle reflection
          distortion: 0.04,      // Micro curvature
          cornerRadius: 28,      // Convex rounded corners
          zRadius: 18,           // Physical bevel depth
          opacity: 0.95,         // Pure transparent glass
          saturation: 0.0,       // Neutral color balance
          tintStrength: 0.01,    // Colorless physical crystal
          brightness: 0.02,      // Subtle shine
          shadowOpacity: 0.08,   // Soft physical contact shadow
          shadowSpread: 12,
          shadowOffsetY: 6,
        };

        instance = await LiquidGlass.init({
          root: rootRef.current,
          glassElements: Array.from(glassElements),
          defaults,
        });

      } catch (err) {
        console.warn("LiquidGlass WebGL fallback active:", err);
      }
    }

    // Delay initialization slightly to ensure DOM layout is complete
    const timer = setTimeout(() => {
      initGlassEngine();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (instance && typeof instance.destroy === "function") {
        instance.destroy();
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="liquid-glass-root relative w-full min-h-screen">
      {children}
    </div>
  );
}
