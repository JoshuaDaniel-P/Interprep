import { TargetRoleCourse, TargetRoleTrack } from "@/types/course";

export const initialRoleCourses: Record<TargetRoleTrack, TargetRoleCourse> = {
  "Software Developer": {
    id: "course-sd",
    roleTrack: "Software Developer",
    title: "Software Developer Master Preparation",
    tagline: "Master Data Structures, Web APIs, System Architecture & STAR Behavioral Answers",
    description: "Comprehensive preparation roadmap for junior to mid-level software engineering roles.",
    modules: [
      {
        id: "m-1",
        title: "1. STAR Behavioral & Communication",
        description: "Structure complex technical stories effectively using Situation, Task, Action, Result.",
        lessons: [
          {
            id: "l-101",
            title: "Structuring Technical Projects in STAR Format",
            durationMinutes: 15,
            summary: "Learn how to quantify impact (e.g. 450ms latency to 25ms) in behavioral answers.",
            keyTopics: ["STAR Framework", "Quantifying Results", "Technical Leadership"],
            practicePrompt: "Describe a project you worked on recently where you solved a major technical bottleneck.",
          },
          {
            id: "l-102",
            title: "Handling Technical Disagreements & Conflict",
            durationMinutes: 20,
            summary: "Structure answers around architectural debates with senior engineers.",
            keyTopics: ["Conflict Resolution", "Trade-off Evaluation", "Consensus Building"],
            practicePrompt: "Tell me about a time when you disagreed with a senior engineer on tech stack selection.",
          },
        ],
      },
      {
        id: "m-2",
        title: "2. System Design & Caching Fundamentals",
        description: "Learn caching patterns, database indexing, and scalability trade-offs.",
        lessons: [
          {
            id: "l-201",
            title: "Redis Caching Strategies & Invalidation",
            durationMinutes: 25,
            summary: "Deep dive into read-through, write-through, TTL, and LRU cache eviction.",
            keyTopics: ["Redis", "Cache Invalidation", "DB Read Bottlenecks"],
            practicePrompt: "How do you determine whether Redis caching is appropriate for a slow database endpoint?",
          },
        ],
      },
    ],
  },
  "Data Scientist": {
    id: "course-ds",
    roleTrack: "Data Scientist",
    title: "Data Scientist Interview Preparation",
    tagline: "ML Model Selection, Feature Engineering, SQL Wrangling & Model Deployment",
    description: "Practical guide to acing data science, machine learning, and analytics interviews.",
    modules: [
      {
        id: "m-1",
        title: "1. Machine Learning & Feature Engineering",
        description: "Model selection, handling missing data, and evaluation metrics.",
        lessons: [
          {
            id: "l-301",
            title: "Evaluating Classifier Performance (Precision vs Recall)",
            durationMinutes: 20,
            summary: "Understand ROC-AUC, F1 score, and precision-recall trade-offs in imbalanced datasets.",
            keyTopics: ["ROC-AUC", "F1 Score", "Confusion Matrix"],
            practicePrompt: "When would you optimize for Precision over Recall in a medical diagnosis or fraud model?",
          },
        ],
      },
    ],
  },
  "UI Designer": {
    id: "course-ui",
    roleTrack: "UI Designer",
    title: "UI/UX Designer Preparation Track",
    tagline: "Design Systems, User Research, Wireframing & Accessibility (a11y)",
    description: "Step-by-step roadmap to present design portfolios and pass UI design interviews.",
    modules: [
      {
        id: "m-1",
        title: "1. Design Systems & Component Libraries",
        description: "Building scalable design tokens, component variants, and accessibility standards.",
        lessons: [
          {
            id: "l-401",
            title: "Designing Accessible Form Controls & Contrast",
            durationMinutes: 15,
            summary: "WCAG contrast guidelines, ARIA semantics, and keyboard focus states.",
            keyTopics: ["WCAG 2.1", "Focus States", "Design Tokens"],
            practicePrompt: "How do you balance aesthetic glassmorphism/minimalism with WCAG contrast requirements?",
          },
        ],
      },
    ],
  },
  "Product Manager": {
    id: "course-pm",
    roleTrack: "Product Manager",
    title: "Product Manager Execution & Strategy",
    tagline: "PRDs, RICE Prioritization, User Metrics & Cross-functional Leadership",
    description: "Master product sense, analytical execution, and stakeholder management questions.",
    modules: [
      {
        id: "m-1",
        title: "1. Product Strategy & Prioritization Frameworks",
        description: "Using RICE, MoSCoW, and Kano models to prioritize feature backlogs.",
        lessons: [
          {
            id: "l-501",
            title: "Defining Guardrail Metrics for New Feature Launches",
            durationMinutes: 20,
            summary: "Learn how to select primary success metrics without hurting retention or latency.",
            keyTopics: ["North Star Metric", "Guardrail Metrics", "A/B Testing"],
            practicePrompt: "How would you measure the success of an AI auto-complete feature in a web app?",
          },
        ],
      },
    ],
  },
  "College Lecturer": {
    id: "course-cl",
    roleTrack: "College Lecturer",
    title: "College Lecturer & Academic Preparation",
    tagline: "Pedagogy, Curriculum Structuring, Student Engagement & Research Defense",
    description: "Prepare for academic interview panels, teaching demonstrations, and research discussions.",
    modules: [
      {
        id: "m-1",
        title: "1. Academic Pedagogy & Classroom Management",
        description: "Designing active learning modules and evaluating student progress.",
        lessons: [
          {
            id: "l-601",
            title: "Designing Engaging Technical Syllabi",
            durationMinutes: 20,
            summary: "Structuring weekly lab assignments, quizzes, and project milestones.",
            keyTopics: ["Bloom's Taxonomy", "Lab Assignments", "Student Assessment"],
            practicePrompt: "How do you adapt your teaching style for students struggling with foundational concepts?",
          },
        ],
      },
    ],
  },
};
