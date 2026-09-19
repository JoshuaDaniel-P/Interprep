import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { getServerDb } from "@/lib/serverFirebase";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => ({}));
    const adminEmail = typeof raw?.adminEmail === "string" ? raw.adminEmail.trim().toLowerCase() : "";

    // Verify caller has admin privileges
    const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
    const adminEmailsList = adminEmailsEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    adminEmailsList.push("admin@preppilot.com");

    if (!adminEmail || !adminEmailsList.includes(adminEmail)) {
      logger.warn("Unauthorized attempt to list candidates", "list-candidates", { adminEmail });
      return NextResponse.json(
        { error: "Unauthorized: Administrator access required." },
        { status: 403 }
      );
    }

    const candidatesList: any[] = [];
    try {
      const db = getServerDb();
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
      logger.warn("Firestore list candidates notice", "list-candidates", dbErr);
    }

    return NextResponse.json({
      candidates: candidatesList,
    });
  } catch (error: any) {
    logger.error("List candidates failure", "list-candidates", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load candidates." },
      { status: 500 }
    );
  }
}
