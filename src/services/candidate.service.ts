import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CandidateProfile, TargetRoleTrack } from "@/types/candidate";
import { calculateReadiness } from "./gapAnalysis.service";

export const defaultMockCandidateProfile: CandidateProfile = {
  uid: "candidate-demo-123",
  email: "alex@example.com",
  fullName: "Alex",
  ageGroup: "22-25",
  city: "San Francisco, CA",
  languages: ["English"],
  status: "Student",
  bio: "Passionate software development candidate preparing for full-stack and systems roles.",
  education: {
    highestQualification: "Bachelor's Degree",
    degree: "B.S. Computer Science",
    branch: "Computer Science",
    institution: "State University",
    graduationYear: 2026,
    cgpaOrPercentage: "3.8 CGPA",
    strongSubjects: ["Data Structures", "Web Development", "Database Systems"],
    weakSubjects: ["Operating Systems", "Networking"],
  },
  skills: [
    { id: "s-1", name: "JavaScript / TypeScript", proficiency: "Intermediate", yearsOfExperience: 2 },
    { id: "s-2", name: "Node.js & Express", proficiency: "Intermediate", yearsOfExperience: 2 },
    { id: "s-3", name: "SQL & Relational DBs", proficiency: "Beginner", yearsOfExperience: 1 },
  ],
  projects: [
    {
      id: "p-1",
      name: "ESP32 Bus Tracking & Payment API",
      problemStatement: "Built a real-time tracking API for public transport buses under high concurrency.",
      technologies: ["Node.js", "Redis", "ESP32", "PostgreSQL"],
      candidateContribution: "Designed backend Redis caching and payment API endpoints.",
      teamSize: 3,
      challenges: "Database query bottleneck taking 450ms under peak load.",
      solution: "Introduced Redis caching layer reducing read latency to 25ms.",
      results: "Handled 10,000+ daily mock requests smoothly.",
    },
  ],
  experience: [],
  achievements: ["Hackathon Finalist 2026", "Dean's List"],
  targetGoal: {
    targetRole: "Software Developer",
    targetCompanyType: "Product Company",
    targetIndustry: "Technology",
    interviewType: "Behavioral",
    difficulty: "Realistic",
  },
  isOnboarded: true,
  readinessPercentage: 68,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class CandidateService {
  async getProfile(uid: string): Promise<CandidateProfile> {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(`preppilot_profile_${uid}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as CandidateProfile;
        if (typeof window !== "undefined") {
          localStorage.setItem(`preppilot_profile_${uid}`, JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn("Firestore fetch error, falling back to local cache:", e);
    }

    if (uid === "candidate-demo-123") {
      return defaultMockCandidateProfile;
    }

    return {
      uid,
      email: "",
      fullName: "",
      status: "Student",
      isOnboarded: false,
      readinessPercentage: 0,
      skills: [],
      projects: [],
      experience: [],
      achievements: [],
      education: {
        highestQualification: "B.Tech / B.E.",
        degree: "Computer Science",
        branch: "Engineering",
        institution: "",
        graduationYear: 2025,
        cgpaOrPercentage: "",
        strongSubjects: [],
        weakSubjects: [],
      },
      targetGoal: {
        targetRole: "Software Developer",
        targetCompanyType: "Product Company",
        targetIndustry: "Technology",
        interviewType: "Behavioral",
        difficulty: "Realistic",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async saveProfile(profile: CandidateProfile): Promise<void> {
    const analysis = calculateReadiness(profile);
    const updatedProfile: CandidateProfile = {
      ...profile,
      readinessPercentage: analysis.readinessPercentage,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`preppilot_profile_${profile.uid}`, JSON.stringify(updatedProfile));
    }

    try {
      const ref = doc(db, "users", profile.uid);
      await setDoc(ref, updatedProfile, { merge: true });
    } catch (e) {
      console.warn("Firestore save error (stored locally):", e);
    }
  }

  async updateCandidateReadinessAfterInterview(
    uid: string,
    categoryScores: Partial<import("@/types/interview").CategoryScores>
  ): Promise<CandidateProfile> {
    const current = await this.getProfile(uid);
    const analysis = calculateReadiness(current, 50, categoryScores);
    const updated: CandidateProfile = {
      ...current,
      readinessPercentage: analysis.readinessPercentage,
      updatedAt: new Date().toISOString(),
    };
    await this.saveProfile(updated);
    return updated;
  }

  async setTargetRole(uid: string, roleTrack: TargetRoleTrack): Promise<CandidateProfile> {
    const current = await this.getProfile(uid);
    const updated: CandidateProfile = {
      ...current,
      targetGoal: {
        ...current.targetGoal,
        targetRole: roleTrack,
      },
    };
    await this.saveProfile(updated);
    return updated;
  }
}

export const candidateService = new CandidateService();
