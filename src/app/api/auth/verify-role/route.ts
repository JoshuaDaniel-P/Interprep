import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const { email, uid } = await req.json();

    if (!email && !uid) {
      return NextResponse.json({ role: "CANDIDATE" });
    }

    const normalizedEmail = (email || "").trim().toLowerCase();

    // 1. Server-side configured Admin list
    const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
    const adminEmailsList = adminEmailsEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    // Default system admin email
    adminEmailsList.push("admin@preppilot.com");

    if (normalizedEmail && adminEmailsList.includes(normalizedEmail)) {
      return NextResponse.json({ role: "ADMIN" });
    }

    // 2. Check Firestore admins collection if uid or email is present
    if (uid) {
      try {
        const adminDocRef = doc(db, "admins", uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          return NextResponse.json({ role: "ADMIN" });
        }

        // Also check if user doc has role === "ADMIN"
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data()?.role === "ADMIN") {
          return NextResponse.json({ role: "ADMIN" });
        }
      } catch (dbErr) {
        console.warn("Firestore role lookup error:", dbErr);
      }
    }

    // Default to NORMAL CANDIDATE
    return NextResponse.json({ role: "CANDIDATE" });
  } catch (error) {
    console.error("verify-role error:", error);
    return NextResponse.json({ role: "CANDIDATE" });
  }
}
