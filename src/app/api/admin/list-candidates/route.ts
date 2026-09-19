import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const { adminEmail } = await req.json();

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
        { error: "Unauthorized: Administrator access required." },
        { status: 403 }
      );
    }

    const candidatesList: any[] = [];
    try {
      const usersRef = collection(db, "users");
      const snap = await getDocs(usersRef);
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.role !== "ADMIN") {
          candidatesList.push({
            id: docSnap.id,
            name: data.fullName || data.name || "Candidate",
            email: data.email || "",
            targetRole: data.targetGoal?.targetRole || "Software Developer",
            status: data.status || "Active",
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }
      });
    } catch (dbErr) {
      console.warn("Firestore list candidates notice:", dbErr);
    }

    return NextResponse.json({
      candidates: candidatesList,
    });
  } catch (error: any) {
    console.error("list-candidates error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load candidates." },
      { status: 500 }
    );
  }
}
