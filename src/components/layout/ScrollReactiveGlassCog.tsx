"use client";

import React, { useEffect, useRef } from "react";

// Precise mathematical geometry for the 12-tooth clear crystal gear
const CX = 360;
const CY = 360;
const TEETH = 12;
const R_TIP = 310;
const R_ROOT = 242;

function generateGearPaths() {
  let outerD = "";

  for (let i = 0; i < TEETH; i++) {
    const step = (Math.PI * 2) / TEETH;
    const a0 = i * step;
    const aRoot1 = a0 + step * 0.10;
    const aTip1 = a0 + step * 0.32;
    const aTip2 = a0 + step * 0.68;
    const aRoot2 = a0 + step * 0.90;

    const pRoot1 = [CX + R_ROOT * Math.cos(aRoot1), CY + R_ROOT * Math.sin(aRoot1)];
    const pTip1 = [CX + R_TIP * Math.cos(aTip1), CY + R_TIP * Math.sin(aTip1)];
    const pTip2 = [CX + R_TIP * Math.cos(aTip2), CY + R_TIP * Math.sin(aTip2)];
    const pRoot2 = [CX + R_ROOT * Math.cos(aRoot2), CY + R_ROOT * Math.sin(aRoot2)];

    if (i === 0) {
      outerD += `M ${pRoot1[0].toFixed(2)} ${pRoot1[1].toFixed(2)} `;
    } else {
      outerD += `A ${R_ROOT} ${R_ROOT} 0 0 1 ${pRoot1[0].toFixed(2)} ${pRoot1[1].toFixed(2)} `;
    }

    const c1 = [
      CX + (R_ROOT + 32) * Math.cos(aRoot1 + 0.05),
      CY + (R_ROOT + 32) * Math.sin(aRoot1 + 0.05),
    ];
    const c2 = [
      CX + (R_TIP - 20) * Math.cos(aTip1 - 0.03),
      CY + (R_TIP - 20) * Math.sin(aTip1 - 0.03),
    ];
    outerD += `C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${pTip1[0].toFixed(2)} ${pTip1[1].toFixed(2)} `;

    outerD += `A ${R_TIP} ${R_TIP} 0 0 1 ${pTip2[0].toFixed(2)} ${pTip2[1].toFixed(2)} `;

    const c3 = [
      CX + (R_TIP - 20) * Math.cos(aTip2 + 0.03),
      CY + (R_TIP - 20) * Math.sin(aTip2 + 0.03),
    ];
    const c4 = [
      CX + (R_ROOT + 32) * Math.cos(aRoot2 - 0.05),
      CY + (R_ROOT + 32) * Math.sin(aRoot2 - 0.05),
    ];
    outerD += `C ${c3[0].toFixed(2)} ${c3[1].toFixed(2)}, ${c4[0].toFixed(2)} ${c4[1].toFixed(2)}, ${pRoot2[0].toFixed(2)} ${pRoot2[1].toFixed(2)} `;
  }
  outerD += "Z ";

  // Axle center bore hole
  const rAxle = 58;
  let axleD = `M ${CX - rAxle} ${CY} `;
  axleD += `A ${rAxle} ${rAxle} 0 1 0 ${CX + rAxle} ${CY} `;
  axleD += `A ${rAxle} ${rAxle} 0 1 0 ${CX - rAxle} ${CY} Z `;

  // 6 curved spoke negative cutouts
  const spokes = 6;
  const rIn = 96;
  const rOut = 196;
  let spokesD = "";
  for (let s = 0; s < spokes; s++) {
    const sStep = (Math.PI * 2) / spokes;
    const sa0 = s * sStep + 0.16;
    const sa1 = (s + 1) * sStep - 0.16;

    const pIn0 = [CX + rIn * Math.cos(sa0), CY + rIn * Math.sin(sa0)];
    const pIn1 = [CX + rIn * Math.cos(sa1), CY + rIn * Math.sin(sa1)];
    const pOut0 = [CX + rOut * Math.cos(sa0), CY + rOut * Math.sin(sa0)];
    const pOut1 = [CX + rOut * Math.cos(sa1), CY + rOut * Math.sin(sa1)];

    spokesD += `M ${pIn0[0].toFixed(2)} ${pIn0[1].toFixed(2)} `;
    spokesD += `L ${pOut0[0].toFixed(2)} ${pOut0[1].toFixed(2)} `;
    spokesD += `A ${rOut} ${rOut} 0 0 1 ${pOut1[0].toFixed(2)} ${pOut1[1].toFixed(2)} `;
    spokesD += `L ${pIn1[0].toFixed(2)} ${pIn1[1].toFixed(2)} `;
    spokesD += `A ${rIn} ${rIn} 0 0 0 ${pIn0[0].toFixed(2)} ${pIn0[1].toFixed(2)} Z `;
  }

  return {
    outerD,
    axleD,
    spokesD,
    compositeD: outerD + axleD + spokesD,
  };
}

const GEOMETRY = generateGearPaths();

export function ScrollReactiveGlassCog() {
  const gearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let targetRotation = 12; // Balanced initial angle
    let currentRotation = 12;
    let rafId: number | null = null;
    let lastScrollY = window.scrollY || window.pageYOffset || 0;

    // Smooth inertia interpolation: settles cleanly to a dead stop when scrolling ends
    const updatePhysics = () => {
      const diff = targetRotation - currentRotation;
      if (Math.abs(diff) > 0.015) {
        currentRotation += diff * 0.085;
        if (gearRef.current) {
          gearRef.current.style.transform = `rotate(${currentRotation.toFixed(3)}deg) translateZ(0)`;
        }
        rafId = requestAnimationFrame(updatePhysics);
      } else {
        currentRotation = targetRotation;
        if (gearRef.current) {
          gearRef.current.style.transform = `rotate(${currentRotation.toFixed(3)}deg) translateZ(0)`;
        }
        rafId = null; // Completely halt RAF execution when motion finishes
      }
    };

    // Passive scroll listener (0ms layout reflow, direct GPU transform updates)
    const onScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Scroll Down (delta > 0) -> Rotate forward (clockwise)
      // Scroll Up (delta < 0) -> Rotate backward (counter-clockwise)
      targetRotation += delta * 0.14;

      if (!rafId) {
        rafId = requestAnimationFrame(updatePhysics);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="fixed right-0 top-[46%] -translate-y-1/2 translate-x-[46%] sm:translate-x-[42%] lg:translate-x-[38%] pointer-events-none z-0 select-none"
      aria-hidden="true"
      style={{
        contain: "layout paint style",
      }}
    >
      {/* Soft Contact Ambient Floor Shadow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(circle at 55% 55%, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.02) 50%, transparent 75%)",
          filter: "blur(24px)",
        }}
      />

      {/* Rotating Cog Container */}
      <div
        ref={gearRef}
        className="w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] md:w-[620px] md:h-[620px] lg:w-[740px] lg:h-[740px] xl:w-[820px] xl:h-[820px] will-change-transform"
        style={{
          transform: "rotate(12deg) translateZ(0)",
          transformOrigin: "50% 50%",
        }}
      >
        <svg
          viewBox="0 0 720 720"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: "drop-shadow(20px 28px 36px rgba(15, 23, 42, 0.08))",
          }}
        >
          <defs>
            {/* Primary Clear Liquid Glass Gradient */}
            <radialGradient
              id="cogGlassBody"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(260 250) rotate(45) scale(400)"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
              <stop offset="38%" stopColor="#f8fafc" stopOpacity="0.36" />
              <stop offset="68%" stopColor="#e2e8f0" stopOpacity="0.18" />
              <stop offset="88%" stopColor="#cbd5e1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.92" />
            </radialGradient>

            {/* Rear Thickness / Depth Facet Gradient */}
            <radialGradient
              id="cogThicknessGrad"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(290 280) rotate(45) scale(390)"
            >
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.40" />
              <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.32" />
            </radialGradient>

            {/* Upper-Left Directional Specular Sheen */}
            <radialGradient
              id="cogSpecularKey"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(230 190) scale(260)"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Inner Caustic Refraction Glow */}
            <radialGradient
              id="cogInternalCaustic"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(450 460) scale(220)"
            >
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.14" />
              <stop offset="45%" stopColor="#93c5fd" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Spoke Bevel Highlighting */}
            <linearGradient id="cogSpokeBevel" x1="150" y1="150" x2="570" y2="570" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.80" />
            </linearGradient>

            {/* Central Axle Collar Gradient */}
            <radialGradient
              id="cogAxleCollar"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(340 340) scale(75)"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#e2e8f0" stopOpacity="0.55" />
              <stop offset="80%" stopColor="#94a3b8" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* ===================================================================
              1. REAR THICKNESS FACET (Simulates physical glass depth & bevel wall)
              Offset down-right to indicate upper-left studio lighting
              =================================================================== */}
          <g transform="translate(10, 14)">
            <path
              d={GEOMETRY.compositeD}
              fill="url(#cogThicknessGrad)"
              stroke="rgba(203, 213, 225, 0.45)"
              strokeWidth="1.8"
              fillRule="evenodd"
            />
          </g>

          {/* ===================================================================
              2. FRONT CLEAR LIQUID GLASS COG BODY
              Composite path: Outer rounded teeth + 6 curved spokes + axle hole
              Punched out with evenodd rule so the light grey studio background
              shows clearly through the spoke openings and center bore!
              =================================================================== */}
          <path
            d={GEOMETRY.compositeD}
            fill="url(#cogGlassBody)"
            stroke="rgba(255, 255, 255, 0.96)"
            strokeWidth="2.8"
            strokeLinejoin="round"
            fillRule="evenodd"
          />

          {/* Internal Caustic Dispersion within the gear web */}
          <circle
            cx={CX}
            cy={CY}
            r={R_ROOT - 12}
            fill="url(#cogInternalCaustic)"
            clipPath="url(#cogSpokeClip)"
          />

          {/* ===================================================================
              3. SPOKE BEVEL OUTLINES (Enhances 3D physical refraction & thickness)
              =================================================================== */}
          <path
            d={GEOMETRY.spokesD}
            fill="none"
            stroke="url(#cogSpokeBevel)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Outer Tooth Root Transition Ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R_ROOT}
            stroke="rgba(255, 255, 255, 0.65)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />

          {/* ===================================================================
              4. CENTRAL AXLE HUB & COLLAR
              Precision-machined optical crystal bore collar
              =================================================================== */}
          {/* Raised Outer Collar */}
          <circle
            cx={CX}
            cy={CY}
            r={76}
            fill="none"
            stroke="url(#cogAxleCollar)"
            strokeWidth="4"
          />
          {/* Inner Axle Glass Lip */}
          <circle
            cx={CX}
            cy={CY}
            r={60}
            fill="none"
            stroke="rgba(255, 255, 255, 0.98)"
            strokeWidth="2"
          />
          {/* Axle Upper Specular Crescent */}
          <path
            d={`M ${CX - 48} ${CY - 34} A 58 58 0 0 1 ${CX + 38} ${CY - 44}`}
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* ===================================================================
              5. PRIMARY SPECULAR RIM HIGHLIGHTS
              Curved light glints along tooth crowns and upper rim
              =================================================================== */}
          <path
            d={`M ${CX - 210} ${CY - 170} A 270 270 0 0 1 ${CX + 90} ${CY - 255}`}
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d={`M ${CX - 210} ${CY - 170} A 270 270 0 0 1 ${CX + 90} ${CY - 255}`}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Secondary Studio Key Sheen */}
          <ellipse
            cx={CX - 110}
            cy={CY - 110}
            rx={90}
            ry={45}
            transform={`rotate(-40 ${CX - 110} ${CY - 110})`}
            fill="url(#cogSpecularKey)"
          />
        </svg>
      </div>

      {/* Stationary Optical Glare Overlay: stays aligned with room lighting even as cog rotates */}
      <div
        className="absolute top-[8%] left-[12%] w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 70%)",
        }}
      />
    </div>
  );
}
