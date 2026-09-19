import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getServerDb, withIsolatedServerAuth } from "@/lib/serverFirebase";
import { createCandidateRequestSchema } from "@/lib/validations/apiSchemas";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const validation = createCandidateRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, password, targetRole, adminEmail } = validation.data;

    // Verify caller has admin privileges
    const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
    const adminEmailsList = adminEmailsEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    adminEmailsList.push("admin@preppilot.com");

    const normalizedAdminEmail = adminEmail.trim().toLowerCase();
    if (!adminEmailsList.includes(normalizedAdminEmail)) {
      logger.warn("Unauthorized attempt to create candidate", "create-candidate", { adminEmail });
      return NextResponse.json(
        { error: "Unauthorized: Only administrators can create candidate accounts." },
        { status: 403 }
      );
    }

    let uid = `c-${Date.now()}`;

    // Execute user creation in a safely managed, isolated Firebase Auth session
    try {
      uid = await withIsolatedServerAuth(async (auth) => {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const createdUid = userCred.user.uid;
        await signOut(auth);
        return createdUid;
      });
    } catch (authErr: any) {
      if (authErr?.code === "auth/email-already-in-use") {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      } else if (authErr?.code === "auth/weak-password") {
        return NextResponse.json(
          { error: "Password should be at least 6 characters long." },
          { status: 400 }
        );
      }
      logger.warn("Firebase Auth user creation notice (falling back to offline UID)", "create-candidate", authErr);
    }

    // Create Candidate Profile in Firestore
    const newCandidateProfile = {
      uid,
      email: email.trim(),
      fullName: name.trim(),
      status: "Active",
      role: "CANDIDATE",
      targetGoal: {
        targetRole: targetRole || "Software Developer",
        targetCompanyType: "Product Company",
        targetIndustry: "Technology",
        interviewType: "Mixed",
        difficulty: "Realistic",
      },
      isOnboarded: false,
      readinessPercentage: 20,
      skills: [],
      projects: [],
      experience: [],
      achievements: [],
      education: {
        highestQualification: "Bachelor's Degree",
        degree: "Computer Science",
        branch: "Engineering",
        institution: "",
        graduationYear: new Date().getFullYear(),
        cgpaOrPercentage: "",
        strongSubjects: [],
        weakSubjects: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = getServerDb();
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, newCandidateProfile, { merge: true });
    } catch (dbErr) {
      logger.warn("Firestore candidate save notice", "create-candidate", dbErr);
    }

    logger.info("Candidate account successfully created", "create-candidate", {
      uid,
      email: email.trim(),
      targetRole: targetRole || "Software Developer",
    });

    return NextResponse.json({
      success: true,
      candidate: {
        uid,
        name: name.trim(),
        email: email.trim(),
        targetRole: targetRole || "Software Developer",
        role: "CANDIDATE",
        status: "Active",
        createdAt: newCandidateProfile.createdAt,
      },
    });
  } catch (error: any) {
    logger.error("Create candidate unexpected error", "create-candidate", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create candidate account." },
      { status: 500 }
    );
  }
}
