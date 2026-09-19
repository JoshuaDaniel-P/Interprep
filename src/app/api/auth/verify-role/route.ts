import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { getServerDb } from "@/lib/serverFirebase";
import { verifyRoleRequestSchema } from "@/lib/validations/apiSchemas";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => ({}));
    const validation = verifyRoleRequestSchema.safeParse(raw);

    const email = validation.success ? validation.data.email : null;
    const uid = validation.success ? validation.data.uid : null;

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

    // 2. Check Firestore admins collection if uid is present
    if (uid) {
      try {
        const db = getServerDb();
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
        logger.warn("Firestore role lookup notice", "verify-role", { uid }, dbErr);
      }
    }

    return NextResponse.json({ role: "CANDIDATE" });
  } catch (error) {
    logger.error("Verify role unexpected error", "verify-role", error);
    return NextResponse.json({ role: "CANDIDATE" });
  }
}
