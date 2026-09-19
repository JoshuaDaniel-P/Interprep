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
  "DevOps & Cloud Engineer": {
    id: "course-devops",
    roleTrack: "DevOps & Cloud Engineer",
    title: "DevOps, SRE & Cloud Engineering Roadmap",
    tagline: "Linux, Containers, Kubernetes, Terraform IaC, CI/CD & Observability",
    description: "Complete progressive roadmap for cloud infrastructure, automation, and site reliability.",
    modules: [
      {
        id: "m-devops-1",
        title: "1. Fundamentals: Linux, Networking & Containers",
        description: "Namespaces, cgroups, L4/L7 load balancing, and multi-stage Docker builds.",
        lessons: [
          {
            id: "l-devops-101",
            title: "Container Isolation & Linux Mechanics",
            durationMinutes: 20,
            summary: "Understand kernel namespaces, cgroups, and container attack surfaces.",
            keyTopics: ["Linux Namespaces", "cgroups", "Docker Security"],
            practicePrompt: "What is the difference between a Linux process, a container (using namespaces and cgroups), and a Virtual Machine running on a hypervisor?",
          },
        ],
      },
      {
        id: "m-devops-2",
        title: "2. Kubernetes Orchestration & Cluster Debugging",
        description: "Pod lifecycles, ingress controllers, HPA, and troubleshooting CrashLoopBackOff.",
        lessons: [
          {
            id: "l-devops-201",
            title: "Kubernetes Pod Lifecycle & Troubleshooting",
            durationMinutes: 25,
            summary: "Diagnosing OOMKilled, liveness probe failures, and secret mounting issues.",
            keyTopics: ["Kubernetes", "CrashLoopBackOff", "Pod Scheduling"],
            practicePrompt: "If a Kubernetes deployment is throwing CrashLoopBackOff, what exact commands and sequence do you use to diagnose the root cause?",
          },
        ],
      },
      {
        id: "m-devops-3",
        title: "3. Infrastructure-as-Code & Observability",
        description: "Terraform state locking, drift detection, Prometheus, and SLO error budgets.",
        lessons: [
          {
            id: "l-devops-301",
            title: "Immutable IaC & Automated Failover",
            durationMinutes: 30,
            summary: "Blue-green vs canary deployments and cross-region disaster recovery.",
            keyTopics: ["Terraform", "GitOps", "Canary Deployments"],
            practicePrompt: "How do you design an immutable Infrastructure-as-Code pipeline using Terraform and GitOps that guarantees zero drift and automated rollback on failure?",
          },
        ],
      },
    ],
  },
  "Embedded Systems Engineer": {
    id: "course-embedded",
    roleTrack: "Embedded Systems Engineer",
    title: "Embedded Systems & Firmware Engineering",
    tagline: "Embedded C, Microcontrollers, RTOS, Bus Protocols (I2C/SPI) & Low-Power Design",
    description: "Hands-on roadmap for bare-metal and RTOS firmware, hardware interfaces, and timing analysis.",
    modules: [
      {
        id: "m-emb-1",
        title: "1. Embedded C & Microcontroller Peripherals",
        description: "Volatile keywords, memory-mapped I/O, interrupt service routines, and register access.",
        lessons: [
          {
            id: "l-emb-101",
            title: "Memory Mapping & Volatile Modifiers",
            durationMinutes: 20,
            summary: "Thread-safety in ISRs, compiler optimization barriers, and peripheral registers.",
            keyTopics: ["volatile", "ISRs", "Memory-Mapped I/O"],
            practicePrompt: "In embedded C programming, why is the volatile keyword critical when declaring variables shared between an ISR and the main loop?",
          },
        ],
      },
      {
        id: "m-emb-2",
        title: "2. Communication Buses & Sensor Interfacing",
        description: "Timing protocols and hardware layers for I2C, SPI, UART, and DMA continuous sampling.",
        lessons: [
          {
            id: "l-emb-201",
            title: "Bus Protocols & Direct Memory Access",
            durationMinutes: 25,
            summary: "SPI 4-wire high-speed vs I2C pull-up limitations, and zero-CPU DMA sampling.",
            keyTopics: ["I2C", "SPI", "DMA"],
            practicePrompt: "Compare the hardware layer and timing characteristics of I2C, SPI, and UART protocols. What are the trade-offs of SPI versus I2C?",
          },
        ],
      },
      {
        id: "m-emb-3",
        title: "3. RTOS Concurrency & Power Optimization",
        description: "Priority inversion, priority inheritance, deep sleep modes, and watchdog servicing.",
        lessons: [
          {
            id: "l-emb-301",
            title: "Real-Time Scheduling & Watchdogs",
            durationMinutes: 30,
            summary: "Priority ceiling protocols, tickless idle modes, and fail-safe recovery.",
            keyTopics: ["FreeRTOS", "Priority Inversion", "Watchdog Timer"],
            practicePrompt: "In hard real-time operating systems (RTOS), what is priority inversion? Explain how Priority Inheritance prevents lower-priority tasks from blocking higher-priority tasks.",
          },
        ],
      },
    ],
  },
  "Mechanical Design Engineer": {
    id: "course-mech",
    roleTrack: "Mechanical Design Engineer",
    title: "Mechanical Design & FEA Simulation",
    tagline: "Solid Mechanics, GD&T, FEA Simulation, Injection Molding & DFM",
    description: "Industry-aligned roadmap for mechanical parts, structural analysis, and manufacturing design.",
    modules: [
      {
        id: "m-mech-1",
        title: "1. Fundamentals: Stress-Strain & Failure Theories",
        description: "Ductile vs brittle behavior, Von Mises vs Tresca, and Mohr's Circle.",
        lessons: [
          {
            id: "l-mech-101",
            title: "Yield Criteria & Stress Tensors",
            durationMinutes: 20,
            summary: "Principal stresses, stress concentrations, and yield prediction under multi-axial loads.",
            keyTopics: ["Stress-Strain", "Von Mises", "Failure Theories"],
            practicePrompt: "Explain the Von Mises yield criterion versus the Tresca criterion. Under what stress states does Von Mises predict yield more accurately for ductile structural alloys?",
          },
        ],
      },
      {
        id: "m-mech-2",
        title: "2. GD&T & Tolerance Stack-up Analysis",
        description: "Datums, feature control frames, MMC/LMC, and statistical RSS stack-ups.",
        lessons: [
          {
            id: "l-mech-201",
            title: "Geometric Dimensioning & Tolerancing (GD&T)",
            durationMinutes: 25,
            summary: "Specifying positional and profile tolerances for precision assemblies.",
            keyTopics: ["GD&T", "MMC", "Tolerance Stack-up"],
            practicePrompt: "What is Geometric Dimensioning and Tolerancing (GD&T)? Explain the difference between MMC (Maximum Material Condition) and LMC (Least Material Condition) when specifying pin and hole fits.",
          },
        ],
      },
      {
        id: "m-mech-3",
        title: "3. Design for Manufacturing (DFM) & FEA",
        description: "Injection molding rules, draft angles, mesh convergence, and thermal dissipation.",
        lessons: [
          {
            id: "l-mech-301",
            title: "Plastic Enclosure Design & FEA Mesh Convergence",
            durationMinutes: 30,
            summary: "Draft angles, uniform wall thickness, rib design, and identifying stress singularities in FEA.",
            keyTopics: ["DFM", "Injection Molding", "FEA Analysis"],
            practicePrompt: "You need to design an injection-molded plastic enclosure requiring snap fits, uniform wall thickness, and draft angles. What specific design rules do you enforce to avoid sink marks and warpage?",
          },
        ],
      },
    ],
  },
  "Civil & Structural Engineer": {
    id: "course-civil",
    roleTrack: "Civil & Structural Engineer",
    title: "Civil & Structural Engineering Roadmap",
    tagline: "Structural Analysis, Reinforced Concrete (RCC), Steel Design, Soil Mechanics & Seismic Codes",
    description: "Rigorous roadmap for structural design, code compliance (IS 456 / ACI 318), and foundation engineering.",
    modules: [
      {
        id: "m-civ-1",
        title: "1. Fundamentals: Shear Force, Bending Moments & Stress Distribution",
        description: "Statically determinate vs indeterminate beams, moment curvature, and flexural stress.",
        lessons: [
          {
            id: "l-civ-101",
            title: "Flexural Mechanics & Determinacy",
            durationMinutes: 20,
            summary: "Bending moment diagrams, shear center, and inflection points.",
            keyTopics: ["SFD & BMD", "Static Indeterminacy", "Flexure Formula"],
            practicePrompt: "What is the physical and mathematical difference between a statically determinate structure and a statically indeterminate structure?",
          },
        ],
      },
      {
        id: "m-civ-2",
        title: "2. Reinforced Concrete (RCC) & Limit State Design",
        description: "Under-reinforced vs over-reinforced beams, shear stirrup design, and crack width control.",
        lessons: [
          {
            id: "l-civ-201",
            title: "RCC Beam Behavior & Limit States",
            durationMinutes: 25,
            summary: "Why codes strictly mandate under-reinforced design for ductile failure warnings.",
            keyTopics: ["RCC Design", "Limit State Method", "Ductile Failure"],
            practicePrompt: "In reinforced concrete (RCC) design according to limit state methods, why do structural codes strictly mandate under-reinforced sections over over-reinforced sections?",
          },
        ],
      },
      {
        id: "m-civ-3",
        title: "3. Geotechnical Foundations & Seismic Design",
        description: "Bearing capacity, Terzaghi equations, seismic ductility, and base shear calculation.",
        lessons: [
          {
            id: "l-civ-301",
            title: "Foundation Engineering & Earthquake Resistance",
            durationMinutes: 30,
            summary: "Shallow vs deep pile foundations and ductile detailing of moment-resisting frames.",
            keyTopics: ["Soil Mechanics", "Pile Foundations", "Seismic Base Shear"],
            practicePrompt: "How do you calculate the ultimate bearing capacity of a shallow foundation using Terzaghi's bearing capacity equation, and how does the groundwater table position affect the calculation?",
          },
        ],
      },
    ],
  },
};
