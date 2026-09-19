import { describe, it, expect } from "vitest";
import { calculateReadiness } from "@/services/gapAnalysis.service";
import { CandidateProfile } from "@/types/candidate";

describe("gapAnalysis.service - calculateReadiness", () => {
  const baseProfile: any = {
    uid: "test-user-1",
    fullName: "Alex Rivera",
    email: "alex@example.com",
    role: "CANDIDATE",
    targetGoal: {
      targetRole: "Software Developer",
      targetCompanyType: "Product Company",
      targetIndustry: "Technology",
      interviewType: "Mixed",
      difficulty: "Realistic",
    },
    isOnboarded: true,
    readinessPercentage: 0,
    skills: ["React", "TypeScript", "Node.js"] as any,
    projects: [
      {
        id: "p-1",
        name: "E-commerce Microservices",
        description: "Built scalable order processing pipeline with RabbitMQ",
        technologies: ["Node.js", "Docker", "RabbitMQ"],
      } as any,
    ],
    experience: [],
    achievements: [],
    education: {
      highestQualification: "Bachelor's Degree",
      degree: "Computer Science",
      branch: "Engineering",
      institution: "State University",
      graduationYear: 2024,
      cgpaOrPercentage: "3.8",
      strongSubjects: ["Algorithms"],
      weakSubjects: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("calculates strictly 0% readiness for a new candidate who has completed zero interview sessions", () => {
    const result = calculateReadiness(baseProfile, 0, undefined);

    expect(result.readinessPercentage).toBe(0);
    expect(result.categoryReadiness.technical).toBe(0);
    expect(result.categoryReadiness.projects).toBe(0);
    expect(result.categoryReadiness.communication).toBe(0);
    expect(result.categoryReadiness.behavioral).toBe(0);
  });

  it("calculates weighted readiness when the candidate has completed an interview simulation", () => {
    const interviewCategoryScores = {
      technicalKnowledge: 85,
      problemSolving: 80,
      projects: 90,
      communication: 75,
      behavioral: 80,
      roleKnowledge: 85,
      companyAwareness: 80,
    };

    const result = calculateReadiness(baseProfile, 0, interviewCategoryScores);

    expect(result.readinessPercentage).toBeGreaterThan(50);
    expect(result.readinessPercentage).toBeLessThanOrEqual(100);
    expect(result.categoryReadiness.technical).toBe(85);
    expect(result.categoryReadiness.projects).toBe(90);
    expect(result.categoryReadiness.communication).toBe(75);
    expect(result.categoryReadiness.behavioral).toBe(80);
    expect(result.keyGaps.length).toBeGreaterThan(0);
  });

  it("provides tailored key skill gaps based on the candidate's target role", () => {
    const result = calculateReadiness(baseProfile, 0, undefined);

    expect(result.roleTrack).toBe("Software Developer");
    expect(result.keyGaps.some((g) => g.skillName.toLowerCase().includes("data structures") || g.skillName.toLowerCase().includes("architecture"))).toBe(true);
  });
});
