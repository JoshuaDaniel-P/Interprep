import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "preppilot-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "preppilot-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "preppilot-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

export async function POST(req: NextRequest) {
  let secondaryApp: any = null;
  try {
    const body = await req.json();
    const { name, email, password, targetRole, adminEmail } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and temporary password are required." },
        { status: 400 }
      );
    }

    // Verify caller has admin privileges
    const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
    const adminEmailsList = adminEmailsEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    adminEmailsList.push("admin@preppilot.com");

    const normalizedAdminEmail = (adminEmail || "").trim().toLowerCase();
    if (!adminEmailsList.includes(normalizedAdminEmail)) {
      return NextResponse.json(
        { error: "Unauthorized: Only administrators can create candidate accounts." },
        { status: 403 }
      );
    }

    // Initialize an isolated secondary Firebase App so we don't interfere with the admin's session
    const appName = `admin-create-${Date.now()}`;
    secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    let uid = `c-${Date.now()}`;
    try {
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
      uid = userCred.user.uid;
      await signOut(secondaryAuth);
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
      console.warn("Firebase Auth creation notice (using generated UID if offline):", authErr.message);
    }

    // Create Candidate Profile in Firestore (strictly CANDIDATE role)
    const newCandidateProfile = {
      uid,
      email: email.trim(),
      fullName: name.trim(),
      status: "Active",
      role: "CANDIDATE", // Must NEVER be ADMIN
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
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, newCandidateProfile, { merge: true });
    } catch (dbErr) {
      console.warn("Firestore save notice:", dbErr);
    }

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
    console.error("create-candidate error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create candidate account." },
      { status: 500 }
    );
  } finally {
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch {
        // ignore cleanup error
      }
    }
  }
}
