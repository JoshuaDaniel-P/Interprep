import { describe, it, expect } from "vitest";
import { getStreamQuestionCount, adaptiveEngine } from "@/services/adaptiveEngine.service";
import { InterviewConfig } from "@/types/interview";

describe("adaptiveEngine.service", () => {
  it("computes role-appropriate dynamic question counts", () => {
    const hrConfig: InterviewConfig = {
      targetRole: "Marketing",
      companyType: "Product Company",
      experienceLevel: "0–2 years",
      interviewType: "HR",
      mode: "Text",
      difficulty: "Realistic",
    };

    expect(getStreamQuestionCount(hrConfig)).toBe(4);

    const devConfig: InterviewConfig = {
      targetRole: "Software Engineer",
      companyType: "Product Company",
      experienceLevel: "2–5 years",
      interviewType: "Mixed",
      mode: "Text",
      difficulty: "Realistic",
    };

    expect(getStreamQuestionCount(devConfig)).toBe(6);

    const customCountConfig: InterviewConfig = {
      ...devConfig,
      questionCount: 8,
    };

    expect(getStreamQuestionCount(customCountConfig)).toBe(8);
  });

  it("generates progressive domain questions matching candidate experience level", () => {
    const config: InterviewConfig = {
      targetRole: "Frontend Developer",
      companyType: "Product Company",
      experienceLevel: "2–5 years",
      interviewType: "Technical",
      mode: "Text",
      difficulty: "Realistic",
    };

    const question1 = adaptiveEngine.generateInitialQuestion(config);
    expect(question1).toBeDefined();
    expect(question1.text.length).toBeGreaterThan(10);
    expect(question1.category).toBeDefined();
  });
});
