"use client";

import React, { useEffect, useRef } from "react";
import { ScrollReactiveGlassCog } from "./ScrollReactiveGlassCog";

export function StudioGlassEnvironment() {
  const layerFarRef = useRef<HTMLDivElement>(null);
  const layerMidRef = useRef<HTMLDivElement>(null);
  const layerNearRef = useRef<HTMLDivElement>(null);

  // High-performance, throttled scroll parallax (zero layout recalculations)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let rafId: number | null = null;
    let lastScrollY = 0;

    const onScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      if (Math.abs(currentScrollY - lastScrollY) < 1) return;
      lastScrollY = currentScrollY;

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (layerFarRef.current) {
          layerFarRef.current.style.transform = `translate3d(0, ${-lastScrollY * 0.02}px, 0)`;
        }
        if (layerMidRef.current) {
          layerMidRef.current.style.transform = `translate3d(0, ${-lastScrollY * 0.05}px, 0)`;
        }
        if (layerNearRef.current) {
          layerNearRef.current.style.transform = `translate3d(0, ${-lastScrollY * 0.09}px, 0)`;
        }
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
      style={{
        contain: "layout paint style",
        transform: "translateZ(0)",
      }}
    >
      {/* =========================================================================
          1. LIGHT GREY STUDIO ENVIRONMENT
          Soft, neutral light grey (#EEF1F4 to #E7EAEE) with dimensional atmospheric gradient
          Zero CSS-filter overhead: 100% native hardware-accelerated radial gradients
          ========================================================================= */}
      {/* Studio Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#DEE1E5] via-[#D5D8DC] to-[#CBCED3]" />

      {/* Top-Left Radiant Key Light Wash (Pure radial gradient, 0ms blur overhead) */}
      <div
        className="absolute -top-40 -left-20 w-[65rem] h-[65rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.85) 0%, rgba(238, 241, 244, 0.45) 45%, transparent 70%)",
        }}
      />

      {/* Studio Floor Soft Ambient Bounce Fill (Pure radial gradient, 0ms blur overhead) */}
      <div
        className="absolute -bottom-40 right-10 w-[60rem] h-[60rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 60% 60%, rgba(203, 213, 225, 0.35) 0%, rgba(238, 241, 244, 0.25) 50%, transparent 75%)",
        }}
      />

      {/* Subtle Studio Corner Vignette for Room Dimensionality */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 65%, rgba(195, 206, 218, 0.20) 100%)",
        }}
      />

      {/* =========================================================================
          2. LAYER 1: FAR DISTANCE (Soft focus via subtle opacity, smaller, slow gentle drift)
          ========================================================================= */}
      <div ref={layerFarRef} className="absolute inset-0 pointer-events-none will-change-transform">
        {/* Top-Left Distant Optical Glass Sphere (~88px) */}
        <div className="absolute top-16 left-[10%] w-20 h-20 sm:w-24 sm:h-24 opacity-60 animate-float-slow-1">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="radial-gradient(circle at 35px 35px, rgba(255,255,255,0.75) 0%, rgba(238,242,246,0.3) 55%, rgba(200,212,226,0.18) 100%)"
              stroke="rgba(255, 255, 255, 0.80)"
              strokeWidth="1.5"
            />
            {/* Upper-left specular crescent */}
            <path
              d="M 28 36 A 40 40 0 0 1 68 22"
              stroke="rgba(255, 255, 255, 0.90)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <ellipse cx="40" cy="32" rx="10" ry="5" transform="rotate(-30 40 32)" fill="rgba(255, 255, 255, 0.85)" />
          </svg>
        </div>

        {/* Top Center-Left Translucent Glass Bubble (~56px) */}
        <div className="absolute top-36 left-[34%] w-14 h-14 sm:w-16 sm:h-16 opacity-40 animate-float-slow-2">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="radial-gradient(circle at 28px 28px, rgba(255,255,255,0.65) 0%, rgba(240,244,248,0.2) 60%, rgba(203,213,225,0.12) 100%)"
              stroke="rgba(255, 255, 255, 0.70)"
              strokeWidth="1.2"
            />
            <path
              d="M 22 30 A 32 32 0 0 1 54 18"
              stroke="rgba(255, 255, 255, 0.80)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          3. LAYER 2: MIDDLE DISTANCE (Moderate scale, liquid morphing, ring, capsule)
          ========================================================================= */}
      <div ref={layerMidRef} className="absolute inset-0 pointer-events-none will-change-transform">
        {/* Top-Right Deforming Organic Liquid Blob (~220px) */}
        <div className="absolute top-8 right-[5%] sm:right-[9%] w-52 h-52 sm:w-60 sm:h-60 opacity-80 animate-float-slow-2">
          <div className="w-full h-full animate-liquid-morph">
            <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
              <defs>
                <radialGradient id="blobBase" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 75) rotate(45) scale(110)">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.82" />
                  <stop offset="50%" stopColor="#EEF2F6" stopOpacity="0.40" />
                  <stop offset="85%" stopColor="#D5DFEA" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.90" />
                </radialGradient>
                <radialGradient id="blobCaustic" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(130 135) scale(60)">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="100" cy="100" rx="86" ry="80" fill="url(#blobBase)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="2.5" />
              <ellipse cx="100" cy="100" rx="84" ry="78" fill="url(#blobCaustic)" />
              {/* Upper-Left Specular Rim */}
              <path d="M 45 75 A 80 75 0 0 1 145 42" stroke="rgba(255, 255, 255, 1)" strokeWidth="4.5" strokeLinecap="round" />
              <ellipse cx="75" cy="62" rx="24" ry="11" transform="rotate(-28 75 62)" fill="rgba(255, 255, 255, 0.90)" />
            </svg>
          </div>
        </div>

        {/* Upper-Right Subtle Glass Torus / Ring (~140px, repositioned away from cog) */}
        <div className="absolute top-[14%] right-[18%] sm:right-[22%] w-32 h-32 sm:w-36 sm:h-36 opacity-45 animate-float-slow-1">
          <div className="w-full h-full animate-tumble-slow">
            <svg viewBox="0 0 180 180" className="w-full h-full" fill="none">
              <defs>
                <radialGradient id="torusGrad" cx="90" cy="90" r="80" fx="65" fy="65" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#EEF2F6" stopOpacity="0.30" />
                  <stop offset="75%" stopColor="#D9E2EC" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.90" />
                </radialGradient>
              </defs>
              {/* Outer Torus Body with Hollow Center */}
              <path
                d="M 90 15 A 75 75 0 1 0 90 165 A 75 75 0 1 0 90 15 Z M 90 55 A 35 35 0 1 1 90 125 A 35 35 0 1 1 90 55 Z"
                fill="url(#torusGrad)"
                stroke="rgba(255, 255, 255, 0.92)"
                strokeWidth="2"
                fillRule="evenodd"
              />
              {/* Outer specular rim highlight */}
              <path d="M 40 55 A 72 72 0 0 1 140 30" stroke="rgba(255, 255, 255, 0.98)" strokeWidth="4" strokeLinecap="round" />
              {/* Inner hole specular rim */}
              <path d="M 68 85 A 33 33 0 0 1 112 70" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Lower-Left Clear Rounded Glass Capsule (~130px x 210px) */}
        <div className="absolute bottom-[20%] left-[3%] sm:left-[5%] w-28 h-48 sm:w-34 sm:h-56 opacity-75 animate-float-slow-3 rotate-[-32deg]">
          <svg viewBox="0 0 120 200" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="capsuleGrad" x1="20" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
                <stop offset="45%" stopColor="#EEF2F6" stopOpacity="0.35" />
                <stop offset="80%" stopColor="#D8E2EC" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.90" />
              </linearGradient>
            </defs>
            {/* Capsule Body */}
            <rect x="15" y="15" width="90" height="170" rx="45" fill="url(#capsuleGrad)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="2.5" />
            {/* Top Rounded Specular Dome Highlight */}
            <path d="M 32 40 A 35 35 0 0 1 88 40" stroke="rgba(255, 255, 255, 0.98)" strokeWidth="3.5" strokeLinecap="round" />
            {/* Lengthwise Light Streak */}
            <line x1="30" y1="55" x2="30" y2="145" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          4. LAYER 3: FOREGROUND DISTANCE (Crisp specular, rolling orb, droplets)
          ========================================================================= */}
      <div ref={layerNearRef} className="absolute inset-0 pointer-events-none will-change-transform">
        {/* Mid-Left Large Subtle Glass Sphere (Outer Margin, ~300px) */}
        <div className="absolute top-[30%] -left-16 sm:-left-20 w-64 h-64 sm:w-76 sm:h-76 opacity-75 animate-float-slow-1">
          <svg viewBox="0 0 300 300" className="w-full h-full" fill="none">
            <circle
              cx="150"
              cy="150"
              r="135"
              fill="radial-gradient(circle at 110px 105px, rgba(255,255,255,0.85) 0%, rgba(238,242,246,0.38) 50%, rgba(205,217,230,0.22) 85%, rgba(255,255,255,0.92) 100%)"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="2.8"
            />
            {/* Upper-left specular crescent highlight */}
            <path d="M 75 110 A 120 120 0 0 1 205 55" stroke="rgba(255, 255, 255, 1)" strokeWidth="5.5" strokeLinecap="round" />
            <ellipse cx="115" cy="90" rx="36" ry="16" transform="rotate(-28 115 90)" fill="rgba(255, 255, 255, 0.92)" />
            {/* Subtle blue reflection accent */}
            <circle cx="195" cy="195" r="55" fill="radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)" />
          </svg>
        </div>

        {/* 
          3D Physical Clear Liquid Crystal Sphere (Rolling Side-to-Side behind UI)
          Faithfully matches the large optical crystal sphere in the visual reference mockup.
          Rolls from left to right, stays/rests, then rolls from right to left, stays/rests.
        */}
        <div className="absolute bottom-6 sm:bottom-12 -left-8 sm:left-4 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none select-none animate-roll-side-to-side opacity-90 z-0">
          {/* Soft ground contact shadow */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.12) 0%, transparent 70%)",
            }}
          />

          {/* Inner rotating crystal glass orb */}
          <div className="w-full h-full animate-roll-rotation">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Base transparent glass sphere gradient */}
                <radialGradient
                  id="sphereBase"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(180 180) rotate(45) scale(200)"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
                  <stop offset="45%" stopColor="#f8fafc" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#e2e8f0" stopOpacity="0.25" />
                  <stop offset="90%" stopColor="#cbd5e1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                </radialGradient>

                {/* Upper primary specular crescent highlight */}
                <radialGradient
                  id="specularUpper"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(140 120) scale(130)"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0.65" />
                  <stop offset="75%" stopColor="#ffffff" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>

                {/* Lower internal caustic refraction glow */}
                <radialGradient
                  id="causticLower"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(250 270) scale(110)"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.20" />
                  <stop offset="40%" stopColor="#60a5fa" stopOpacity="0.12" />
                  <stop offset="80%" stopColor="#93c5fd" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Glass body */}
              <circle
                cx="200"
                cy="200"
                r="165"
                fill="url(#sphereBase)"
                stroke="rgba(255, 255, 255, 0.98)"
                strokeWidth="3.5"
              />

              {/* Internal caustic reflection */}
              <circle
                cx="200"
                cy="200"
                r="163"
                fill="url(#causticLower)"
              />

              {/* Bright curved specular rim arc: Outer soft glow stroke */}
              <path
                d="M 85 145 A 155 155 0 0 1 275 70"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="11"
                strokeLinecap="round"
              />
              {/* Inner crisp specular rim stroke */}
              <path
                d="M 85 145 A 155 155 0 0 1 275 70"
                stroke="rgba(255, 255, 255, 1)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Secondary bright glare highlight */}
              <ellipse
                cx="145"
                cy="120"
                rx="55"
                ry="26"
                transform="rotate(-30 145 120)"
                fill="url(#specularUpper)"
              />

              {/* Soft secondary rim bounce on opposite side */}
              <path
                d="M 285 270 A 155 155 0 0 1 205 345"
                stroke="rgba(255, 255, 255, 0.90)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Small Crystal Droplets (Margins & Bottom) */}
        {/* Droplet 1: Left Bottom */}
        <div className="absolute bottom-20 left-[26%] w-9 h-9 opacity-75 animate-float-slow-3">
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            <circle cx="20" cy="20" r="17" fill="radial-gradient(circle at 14px 14px, #ffffff 0%, rgba(238,242,246,0.4) 60%, rgba(200,212,226,0.2) 100%)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="1.2" />
            <circle cx="16" cy="15" r="3.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Droplet 2: Right Bottom */}
        <div className="absolute bottom-28 right-[24%] w-11 h-11 opacity-80 animate-float-slow-2">
          <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
            <circle cx="25" cy="25" r="21" fill="radial-gradient(circle at 18px 18px, #ffffff 0%, rgba(238,242,246,0.4) 60%, rgba(200,212,226,0.2) 100%)" stroke="rgba(255, 255, 255, 0.95)" strokeWidth="1.4" />
            <circle cx="20" cy="19" r="4" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          5. HERO OPTICAL MECHANICAL ARTIFACT: SCROLL-REACTIVE CLEAR LIQUID-GLASS COG
          Positioned partly off-screen on the right edge.
          Rotates forward on scroll down, backward on scroll up, halts cleanly when idle.
          100% transparent physical liquid glass with internal caustics & Fresnel highlights.
          ========================================================================= */}
      <ScrollReactiveGlassCog />
    </div>
  );
}
