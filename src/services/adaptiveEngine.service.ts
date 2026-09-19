import { InterviewConfig, InterviewQuestion } from "@/types/interview";
import { CandidateProfile } from "@/types/candidate";

export function getStreamQuestionCount(config: InterviewConfig): number {
  if (config.questionCount && config.questionCount > 0) {
    return config.questionCount;
  }

  // Stream-specific dynamic question length
  if (config.interviewType === "HR" || config.targetRole === "Marketing" || config.targetRole === "Sales") {
    return 4;
  }
  if (
    config.interviewType === "Mixed" ||
    config.targetRole === "Software Engineer" ||
    config.targetRole === "Software Developer"
  ) {
    return 6;
  }
  return 5; // Standard technical streams
}

// ---------------------------------------------------------------------------
// Progressive Real-Company Question Matrix by Domain & Experience Level
// Sourced from top tech interview loops (Google, Amazon, Meta, Microsoft, Stripe)
// Stages:
// 1. Fundamentals & Core Concepts (Basics of the domain)
// 2. Applied Problem Solving & Practical Code/Data/UI Scenario
// 3. System Architecture, Trade-offs & Bottlenecks
// 4. Engineering Workflow, Team Collaboration & STAR Behavioral
// 5. High-Impact Delivery, Company Mission & Alignment
// ---------------------------------------------------------------------------

interface DomainStageQuestions {
  stage1_basics: Record<string, string>; // key = exp level
  stage2_applied: Record<string, string>;
  stage3_architecture: Record<string, string>;
  stage4_collaboration: string;
  stage5_companyFit: string;
}

const realCompanyQuestionMatrix: Record<string, DomainStageQuestions> = {
  "Frontend Developer": {
    stage1_basics: {
      Student:
        "Can you explain the difference between the JavaScript call stack and the event loop? Specifically, how do microtasks (such as Promises) differ from macrotasks (such as setTimeout) when asynchronous code executes?",
      "0–2 years":
        "In the CSS Box Model, what are the differences between content, padding, border, and margin, and how does specifying `box-sizing: border-box` change layout calculations across responsive viewports?",
      "2–5 years":
        "How does React's Virtual DOM reconciliation algorithm work under the hood? Why is the `key` prop essential in lists, and what specific rendering or state bugs can occur if you use an array index as a key during reordering?",
      "5+ years":
        "Walk me through the Critical Rendering Path from raw HTML/CSS bytes to first paint. How do async and defer script tags, CSSOM blocking, and layout reflows impact initial page render performance?",
    },
    stage2_applied: {
      Student:
        "In React, what is the difference between props and state? If a child component needs to communicate data back up to a parent component, how do you structure that data flow?",
      "0–2 years":
        "When building a search or filter input in React, how do you implement debouncing to prevent firing an API request on every keystroke, and how do you handle cancellation if a user types rapidly?",
      "2–5 years":
        "When managing complex application state, how do you decide between React local component state, the Context API, and an external store like Zustand or Redux? What are the performance hazards of putting frequently changing data into Context?",
      "5+ years":
        "Imagine you need to render a virtualized data table with 50,000 live updating rows. How would you design the component architecture, manage windowing, and prevent main-thread UI jank?",
    },
    stage3_architecture: {
      Student:
        "What are Core Web Vitals (LCP, FID/INP, CLS), and what is one practical technique you would use to optimize image loading on a web page?",
      "0–2 years":
        "How do you handle client-side caching and error boundaries in React to ensure the UI fails gracefully when a backend endpoint returns a 500 error?",
      "2–5 years":
        "Between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG), what are the trade-offs regarding SEO, TTFB (Time to First Byte), and server compute load?",
      "5+ years":
        "How would you architect a microfrontend system or an enterprise design system across multiple distributed product teams while maintaining strict bundle size budgets and zero version drift?",
    },
    stage4_collaboration:
      "Can you describe a situation where a designer asked for an animation or UI layout that you knew would significantly degrade browser rendering performance or violate WCAG accessibility guidelines? How did you communicate the trade-off and reach a consensus?",
    stage5_companyFit:
      "Why are you interested in joining our front-end engineering team, and what is your approach to staying current with fast-moving web platform specifications and browser standards?",
  },

  "Backend Developer": {
    stage1_basics: {
      Student:
        "Can you explain the difference between a process and a thread, and how memory is partitioned between the stack and the heap in server runtimes?",
      "0–2 years":
        "What are the semantic differences between HTTP GET, POST, PUT, and PATCH, and what is the exact difference between status codes 401 (Unauthorized) and 403 (Forbidden)?",
      "2–5 years":
        "In relational databases, what is the difference between clustered and non-clustered indexes (B-Tree)? How does an index speed up read queries, and what is the cost on write throughput?",
      "5+ years":
        "Explain the CAP Theorem (Consistency, Availability, Partition Tolerance). In modern distributed data systems, what are the architectural trade-offs between CP systems (e.g. HBase, CockroachDB) and AP systems (e.g. Cassandra, DynamoDB)?",
    },
    stage2_applied: {
      Student:
        "In SQL, what is the difference between an INNER JOIN and a LEFT JOIN? What happens to records from the left table when there is no matching row in the right table?",
      "0–2 years":
        "How do you implement authentication and session verification in backend APIs? What are the security trade-offs between stateless JWT tokens stored in HTTP-only cookies versus server-side session stores (like Redis)?",
      "2–5 years":
        "How do you design idempotent API endpoints for payment or checkout services so that accidental network retries from a client never result in double-charging or duplicate database entries?",
      "5+ years":
        "Walk me through how you design database connection pooling, query timeouts, and circuit breakers to prevent a sudden spike in slow database queries from cascading into total backend service starvation.",
    },
    stage3_architecture: {
      Student:
        "What is caching, and why is an in-memory store like Redis or Memcached faster than querying a relational database on disk?",
      "0–2 years":
        "When using Redis for caching database queries, how do you handle cache invalidation, and what is the difference between a write-through cache and a cache-aside pattern?",
      "2–5 years":
        "What is a cache stampede (or thundering herd problem), and how do you protect your backend when a hot cache key with 10,000 concurrent requests expires simultaneously?",
      "5+ years":
        "How would you design an event-driven distributed system using Apache Kafka or RabbitMQ to guarantee at-least-once or exactly-once processing semantics across independent microservices?",
    },
    stage4_collaboration:
      "Tell me about a time you had a technical disagreement with a frontend engineer or another backend colleague regarding an API contract or schema structure. How did you resolve the difference and document the contract?",
    stage5_companyFit:
      "When maintaining critical 24/7 production backend services, what is your methodology for automated testing, deployment safety (canary/blue-green), and structured monitoring?",
  },

  "Software Engineer": {
    stage1_basics: {
      Student:
        "Can you explain Big-O notation, and what the time and space complexity difference is between an Array and a Singly Linked List when accessing by index versus inserting at the head?",
      "0–2 years":
        "Explain how a Hash Table achieves average O(1) lookup time. What is a hash collision, and what is the difference between collision resolution using chaining versus open addressing?",
      "2–5 years":
        "Can you explain the difference between Synchronous and Asynchronous execution models? How does an operating system or runtime handle non-blocking I/O multiplexing (such as epoll or libuv)?",
      "5+ years":
        "In high-scale software engineering, what are the primary trade-offs between a monolithic codebase and a microservice architecture? Under what organizational and technical conditions does decomposing a monolith become counterproductive?",
    },
    stage2_applied: {
      Student:
        "Can you explain the core principles of Object-Oriented Programming (Encapsulation, Inheritance, Polymorphism, Abstraction) and give a simple code example where Polymorphism is superior to a large if-else or switch statement?",
      "0–2 years":
        "How do you approach unit testing and test-driven development? What is the difference between a Mock, a Stub, and a Fake when testing a service that interacts with an external dependency?",
      "2–5 years":
        "Walk me through how you identify and debug a memory leak or CPU spike in a running service. What diagnostic tools and profilers do you employ to isolate the offending code path?",
      "5+ years":
        "How do you handle distributed transactions across independent services without distributed locks (e.g. SAGA pattern, two-phase commit)? What are the compensation mechanisms if a downstream step fails?",
    },
    stage3_architecture: {
      Student:
        "What is the difference between vertical scaling and horizontal scaling, and what are the limitations of simply adding more CPU and RAM to a single machine?",
      "0–2 years":
        "How do you ensure data integrity in database transactions? Explain the ACID properties (Atomicity, Consistency, Isolation, Durability) with a practical example.",
      "2–5 years":
        "When designing a system that must handle 100,000 requests per second with strict sub-50ms latency SLAs, where are the first three bottlenecks you look for and how do you alleviate each?",
      "5+ years":
        "Describe how you would design a globally distributed rate-limiter or distributed ID generator (like Snowflake) that guarantees uniqueness, high throughput, and high availability.",
    },
    stage4_collaboration:
      "Tell me about a high-stakes production bug or outage that was traced back to code you wrote or reviewed. How did you communicate with stakeholders, triage the issue, and what blameless post-mortem actions did you implement?",
    stage5_companyFit:
      "Why are you interested in building software for our team specifically, and how do you balance rapid delivery against accumulating technical debt in fast-paced product cycles?",
  },

  "Software Developer": {
    stage1_basics: {
      Student:
        "Explain the difference between compile-time and runtime errors, and how exception handling (try-catch-finally) prevents an application from abruptly crashing.",
      "0–2 years":
        "What does the DRY (Don't Repeat Yourself) principle mean in practice, and how do you know when code reuse has created unnecessary coupling between unrelated modules?",
      "2–5 years":
        "Can you explain the Dependency Injection pattern and how it improves code testability and modularity compared to hardcoded object instantiation?",
      "5+ years":
        "What are the SOLID principles in software engineering, and can you walk me through an example of the Single Responsibility Principle and Open/Closed Principle applied to production code?",
    },
    stage2_applied: {
      Student:
        "When working with version control (Git), what is the difference between `git merge` and `git rebase`? In what scenario might a rebase create confusion for other contributors on a shared branch?",
      "0–2 years":
        "How do you structure validation and sanitization for incoming user inputs to prevent security vulnerabilities such as SQL Injection or Cross-Site Scripting (XSS)?",
      "2–5 years":
        "Walk me through a refactoring project where you took a legacy, poorly tested codebase or endpoint and modernized it. How did you ensure zero functional regressions occurred?",
      "5+ years":
        "How do you lead architecture reviews and establish engineering standards across multiple software teams with varying levels of experience?",
    },
    stage3_architecture: {
      Student:
        "What is the difference between SQL relational databases and NoSQL document databases? Give one scenario where you would prefer a relational database.",
      "0–2 years":
        "How do you design RESTful endpoints with pagination, filtering, and sorting for collections that contain tens of thousands of records?",
      "2–5 years":
        "How do you manage concurrent access to shared resources in multi-threaded or multi-instance applications to prevent race conditions and deadlocks?",
      "5+ years":
        "How do you architect a backend service to support multi-tenant isolation, data residency, and GDPR compliance while maintaining cost efficiency?",
    },
    stage4_collaboration:
      "Describe a situation where a product manager requested a deadline that was technically unrealistic without cutting corners on testing. How did you negotiate scope and reach a pragmatic compromise?",
    stage5_companyFit:
      "What engineering habits do you cultivate to maintain high code quality, and why does our company's mission appeal to you?",
  },

  "Data Scientist": {
    stage1_basics: {
      Student:
        "Can you explain the difference between Supervised and Unsupervised learning, and why it is critical to split data into training, validation, and test splits?",
      "0–2 years":
        "What is the difference between a Type I error (False Positive) and a Type II error (False Negative)? In what real-world domain is a Type II error far more costly than a Type I error?",
      "2–5 years":
        "Explain the Bias-Variance tradeoff. How do you diagnose whether a model is suffering from high bias (underfitting) versus high variance (overfitting), and what specific remedies do you apply for each?",
      "5+ years":
        "Walk me through the mathematical formulation and assumptions behind Linear Regression (homoscedasticity, normality of residuals, multicollinearity). How do you test for and correct violations of these assumptions in production data?",
    },
    stage2_applied: {
      Student:
        "In Python data manipulation, how do you handle missing (NaN) values in a Pandas DataFrame? What are the trade-offs between dropping missing rows versus imputing with mean, median, or forward-fill?",
      "0–2 years":
        "When preparing raw categorical and numerical features for a model, how do you decide between One-Hot Encoding versus Target/Frequency Encoding, and when is standard normalization (z-score) preferred over min-max scaling?",
      "2–5 years":
        "When dealing with severely imbalanced classification datasets (e.g. 99.5% negative class, 0.5% positive class), why is accuracy a misleading metric? What evaluation metrics (Precision-Recall AUC vs ROC-AUC) and sampling strategies (SMOTE, class weights) do you utilize?",
      "5+ years":
        "Walk me through the design of an automated feature store and training pipeline. How do you prevent data leakage between past training records and future feature lookups?",
    },
    stage3_architecture: {
      Student:
        "What is the difference between a Decision Tree and a Random Forest ensemble, and how does bagging reduce model variance?",
      "0–2 years":
        "How do gradient boosted trees (like XGBoost or LightGBM) work sequentially, and how do hyperparameters like learning rate, max depth, and subsample ratio prevent overfitting?",
      "2–5 years":
        "How do you transition a machine learning model from a Jupyter Notebook into a low-latency production inference service? How do you monitor for concept drift and covariate shift over time?",
      "5+ years":
        "Describe how you would design an online A/B testing framework to evaluate whether a new recommendation model delivers statistically significant lift without cannibalizing secondary engagement metrics.",
    },
    stage4_collaboration:
      "Tell me about a time you had to explain complex model predictions (e.g. black-box embeddings or tree ensembles) to skeptical business stakeholders who demanded interpretable rules. How did you present your findings (e.g. SHAP, LIME)?",
    stage5_companyFit:
      "How do your data science passions and methodological strengths align with the data problems we solve at our company?",
  },

  "Data Analyst": {
    stage1_basics: {
      Student:
        "What is the fundamental difference between the `WHERE` clause and the `HAVING` clause in SQL, and can you give an example query where you must use both?",
      "0–2 years":
        "What is the difference between `COUNT(*)`, `COUNT(column_name)`, and `COUNT(DISTINCT column_name)`, and how do NULL values affect these calculations?",
      "2–5 years":
        "Can you explain how Window Functions work? What is the difference between `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()`, and in what reporting scenario would you use each?",
      "5+ years":
        "What are the fundamental differences between Star Schema and Snowflake Schema in data warehousing? How do dimensional modeling decisions impact query speed on columnar data warehouses (like BigQuery, Snowflake, or Redshift)?",
    },
    stage2_applied: {
      Student:
        "If you are given an e-commerce sales dataset, how would you write a SQL query to calculate the month-over-month revenue growth rate?",
      "0–2 years":
        "How do you design a dashboard in Tableau, PowerBI, or Looker so that executive stakeholders can instantly identify operational anomalies without getting lost in data clutter?",
      "2–5 years":
        "If our company's Daily Active Users (DAU) dropped by 12% over the last 7 days while overall registrations increased, walk me through your step-by-step diagnostic cohort analysis to isolate the cause.",
      "5+ years":
        "How do you establish automated data quality monitoring and anomaly detection to catch corrupt or delayed upstream data before it impacts executive reports?",
    },
    stage3_architecture: {
      Student:
        "What is the difference between qualitative and quantitative analysis, and why is data cleaning typically 80% of an analyst's workload?",
      "0–2 years":
        "In analytical reporting, what is Simpson's Paradox? Can you describe a scenario where aggregating data across groups reverses the apparent conclusion?",
      "2–5 years":
        "How do you design clean, reproducible ETL/ELT pipelines using SQL and Python (dbt, Airflow) rather than relying on manual spreadsheet transformations?",
      "5+ years":
        "How do you build a single source of truth semantic data layer across conflicting definitions of metrics (e.g., Active User, Churn, ARR) across sales, product, and finance?",
    },
    stage4_collaboration:
      "Tell me about a time when your data analysis disproved a strongly held hypothesis or pet project of a senior leader. How did you present the data objectively without alienating the team?",
    stage5_companyFit:
      "Why do you want to be a Data Analyst on our team, and what business metrics are you most eager to analyze here?",
  },

  "UI Designer": {
    stage1_basics: {
      Student:
        "What is the difference between a wireframe, a mockup, and an interactive prototype, and at what stage of the product design cycle do you create each?",
      "0–2 years":
        "How do you use font scale, weight, and line-height to establish hierarchy on mobile screens with limited viewport real estate?",
      "2–5 years":
        "What are the WCAG 2.1 AA color contrast standards for text and interactive UI elements, and how do you balance accessibility with modern minimalist aesthetic trends?",
      "5+ years":
        "What is an atomic design system, and how do you structure components, variants, and design tokens in Figma to enable scalable, multi-brand design systems?",
    },
    stage2_applied: {
      Student:
        "When designing a multi-step user onboarding flow, how do you minimize cognitive load and decrease user drop-off?",
      "0–2 years":
        "How do you prepare design files and component specifications in Figma for front-end developers to ensure spacing, typography, and states (hover, focus, disabled, active) are implemented accurately?",
      "2–5 years":
        "Walk me through a user usability testing protocol you ran on an interactive prototype. What methodology did you use to synthesize user feedback into actionable redesign priorities?",
      "5+ years":
        "How do you conduct comprehensive user journey mapping and empathy research when designing software for complex enterprise workflows with high specialized domain jargon?",
    },
    stage3_architecture: {
      Student:
        "What is the difference between responsive design and adaptive design when designing for desktop versus mobile viewports?",
      "0–2 years":
        "How do you design accessible form controls (inputs, dropdowns, error messages) that maintain keyboard navigation and screen-reader usability?",
      "2–5 years":
        "How do you measure the quantitative impact of a design overhaul (e.g. task completion rate, time-on-task, SUS score)?",
      "5+ years":
        "How do you govern and version a design system across dozens of product designers and engineering teams to prevent rogue detached components?",
    },
    stage4_collaboration:
      "Describe a situation where engineering informed you that your proposed interaction or design was too technically costly or impossible to implement within sprint deadlines. How did you collaborate to find a creative compromise?",
    stage5_companyFit:
      "What aspects of our product's user experience do you find most compelling, and what UX friction points would you be excited to tackle first?",
  },

  "Product Manager": {
    stage1_basics: {
      Student:
        "What is the definition of a Minimum Viable Product (MVP), and what is the crucial difference between delivering product features (output) versus driving business outcomes?",
      "0–2 years":
        "How do you write a clear User Story, and what makes an effective Acceptance Criteria from both an engineering and user perspective?",
      "2–5 years":
        "How do you use frameworks like RICE (Reach, Impact, Confidence, Effort) or MoSCoW to prioritize competing feature demands from sales, executive leadership, and customer feedback?",
      "5+ years":
        "What is a North Star Metric? Walk me through how you identify a single primary metric and counter-metrics for a product to ensure team alignment without unintended negative side-effects.",
    },
    stage2_applied: {
      Student:
        "If users are dropping off at step 3 of a 5-step signup funnel, how would you gather both quantitative telemetry and qualitative user insights to diagnose the problem?",
      "0–2 years":
        "Walk me through how you structure a Product Requirements Document (PRD). How do you communicate the 'Why' and business context clearly to engineering and design?",
      "2–5 years":
        "If engineering estimates that a critical strategic feature will take three times longer than originally planned, how do you handle de-scoping while still delivering value to users?",
      "5+ years":
        "Describe your framework for entering a new market or launching a 0-to-1 product line. How do you validate market demand before committing significant engineering resources?",
    },
    stage3_architecture: {
      Student:
        "What is the difference between an Agile sprint and a Waterfall development process, and why do most tech startups prefer iterative sprints?",
      "0–2 years":
        "How do you design a customer feedback loop to separate vocal minority complaints from broad user needs?",
      "2–5 years":
        "How do you distinguish between leading indicators (like feature adoption) and lagging indicators (like annual churn) when evaluating product health?",
      "5+ years":
        "How do you balance investing in technical infrastructure and refactoring against executive pressure to constantly ship customer-facing features?",
    },
    stage4_collaboration:
      "Tell me about a time you had to say 'No' to a high-priority feature request from a key executive or high-paying client. How did you communicate the rationale and manage the relationship?",
    stage5_companyFit:
      "What product opportunity in our company's market segment do you think is currently underserved, and how would you validate it?",
  },

  "College Lecturer": {
    stage1_basics: {
      Student:
        "How do you introduce abstract programming concepts like variables, loops, and conditionality to complete beginners who have no prior computer science background?",
      "0–2 years":
        "How do you design classroom coding exercises that balance encouraging creative exploration with reinforcing strict syntactic discipline?",
      "2–5 years":
        "When explaining complex data structures (like recursion or memory pointers), what analogical models or visual demonstrations do you find most effective?",
      "5+ years":
        "How do you continuously align academic computer science curricula with rapidly changing industry expectations and modern tooling?",
    },
    stage2_applied: {
      Student:
        "How do you identify and support students who are falling behind early in the semester before they fail midterm assessments?",
      "0–2 years":
        "How do you design fair grading rubrics that evaluate both code correctness and code readability/style?",
      "2–5 years":
        "How do you integrate generative AI tools (like Copilot) constructively into classroom assignments while ensuring students develop foundational problem-solving abilities?",
      "5+ years":
        "How do you mentor junior faculty and teaching assistants to ensure grading consistency across large multi-section courses?",
    },
    stage3_architecture: {
      Student:
        "What strategies do you use to encourage active participation and questions during large lecture halls?",
      "0–2 years":
        "How do you structure collaborative group projects to prevent free-riding and ensure individual accountability?",
      "2–5 years":
        "How do you balance theoretical mathematical rigor with practical, job-ready project experience in computer science courses?",
      "5+ years":
        "Describe your methodology for developing an accredited degree curriculum from foundational theory to capstone projects.",
    },
    stage4_collaboration:
      "Tell me about a time a student challenged an exam grade or accused an assignment of being unfair. How did you handle the situation objectively and constructively?",
    stage5_companyFit:
      "Why do you want to teach at our institution, and what pedagogical philosophy guides your classroom instruction?",
  },

  Marketing: {
    stage1_basics: {
      Student:
        "Can you explain the difference between Customer Acquisition Cost (CAC) and Customer Lifetime Value (LTV), and why the LTV:CAC ratio is a primary metric for tech businesses?",
      "0–2 years":
        "In digital marketing, what is the difference between organic growth (SEO, content) and paid performance marketing (PPC, social ads), and how do you calculate Return on Ad Spend (ROAS)?",
      "2–5 years":
        "How does multi-touch attribution (first-touch, last-touch, linear, W-shaped) differ from single-touch models, and how do privacy changes (like iOS ATT) impact attribution accuracy?",
      "5+ years":
        "Walk me through how you build a comprehensive Go-To-Market (GTM) strategy for a B2B SaaS product from initial positioning to scalable inbound/outbound demand generation.",
    },
    stage2_applied: {
      Student:
        "How do you structure an A/B test on a landing page headline and call-to-action (CTA) to determine statistical significance?",
      "0–2 years":
        "How do you build an email nurture workflow for trial users that boosts free-to-paid conversion rates without triggering unsubscribe churn?",
      "2–5 years":
        "If your paid acquisition CAC increased by 30% month-over-month on Google Ads, walk me through your diagnostic audit to isolate the cause.",
      "5+ years":
        "How do you allocate an annual multi-million dollar marketing budget across brand awareness, product marketing, and direct performance channels?",
    },
    stage3_architecture: {
      Student:
        "What is a marketing funnel (Top of Funnel, Middle of Funnel, Bottom of Funnel), and what content formats work best at each stage?",
      "0–2 years":
        "How do you measure marketing ROI when long enterprise sales cycles take 6 to 12 months from first touch to close?",
      "2–5 years":
        "How do you leverage product-led growth (PLG) viral loops to reduce reliance on paid ad spend?",
      "5+ years":
        "Describe how you repositioned a product that was losing market share against a well-funded incumbent competitor.",
    },
    stage4_collaboration:
      "Describe a situation where product marketing and sales disagreed on the primary ICP (Ideal Customer Profile) or messaging narrative. How did you align the two teams around shared revenue goals?",
    stage5_companyFit:
      "Why do you want to lead marketing for our brand, and what growth channel do you think is our biggest untapped opportunity?",
  },

  Sales: {
    stage1_basics: {
      Student:
        "What is the difference between an inbound lead and an outbound lead, and what is the qualification framework BANT (Budget, Authority, Need, Timeline)?",
      "0–2 years":
        "In enterprise software sales, how do you conduct an effective discovery call that uncovers a prospect's true business pain points rather than simply pitching feature specs?",
      "2–5 years":
        "How do you use the MEDDIC framework to qualify complex enterprise deals and ensure you are speaking with economic decision-makers?",
      "5+ years":
        "Walk me through your strategy for managing an enterprise sales pipeline with multi-stakeholder purchasing committees, legal compliance, and procurement reviews.",
    },
    stage2_applied: {
      Student:
        "When a prospect immediately objects with 'Your product is too expensive compared to free alternatives', how do you respond to reframe the value?",
      "0–2 years":
        "How do you handle competitive objections when a prospect mentions they are already in late-stage discussions with a well-known market incumbent?",
      "2–5 years":
        "Walk me through a complex deal that stalled in procurement or legal. What specific steps did you take to re-energize the internal champion and close the contract before end of quarter?",
      "5+ years":
        "How do you architect compensation plans, sales territories, and quota distributions that motivate an enterprise sales organization while maintaining healthy margins?",
    },
    stage3_architecture: {
      Student:
        "What is the role of an Account Executive (AE) versus a Sales Development Representative (SDR) in modern B2B SaaS sales?",
      "0–2 years":
        "How do you identify who the true internal champion is versus a curious non-decision-maker during early demo meetings?",
      "2–5 years":
        "How do you expand annual contract value (ACV) within existing accounts through land-and-expand upselling strategies?",
      "5+ years":
        "Describe how you built an enterprise partner channel strategy that augmented your direct sales force.",
    },
    stage4_collaboration:
      "Tell me about a deal where the customer demanded a custom product feature that engineering was hesitant to build. How did you navigate the conversation with the product team without losing the customer or creating untenable tech debt?",
    stage5_companyFit:
      "What excites you about selling our product in this market, and what is your track record of quota attainment in past roles?",
  },

  "DevOps & Cloud Engineer": {
    stage1_basics: {
      Student:
        "What is the difference between a Linux process, a container (using namespaces and cgroups), and a Virtual Machine running on a hypervisor?",
      "0–2 years":
        "Explain the difference between a forward proxy, a reverse proxy (like Nginx), and a Layer 4 vs Layer 7 load balancer. In what scenario would you choose L7 routing?",
      "2–5 years":
        "In Kubernetes, walk me through the lifecycle of a Pod from creation via `kubectl apply` to running state. How do kube-apiserver, kube-scheduler, etcd, and kubelet coordinate this?",
      "5+ years":
        "How do you design an immutable Infrastructure-as-Code (IaC) pipeline using Terraform and GitOps (ArgoCD/Flux) that guarantees zero drift, automated rollback on canary failure, and zero-downtime database schema migrations?",
    },
    stage2_applied: {
      Student:
        "How do you write a multi-stage Dockerfile for a Node.js or Go application to minimize the final production image size and eliminate build tool dependencies from the runtime container?",
      "0–2 years":
        "If a Kubernetes deployment is throwing `CrashLoopBackOff`, what exact commands and sequence do you use to diagnose whether it is an OOMKilled error, failed liveness probe, or missing environment secret?",
      "2–5 years":
        "How do you configure horizontal pod autoscaling (HPA) using custom Prometheus metrics (such as HTTP request rate or Kafka consumer lag) rather than simple CPU/Memory thresholds?",
      "5+ years":
        "During a major production incident where latency spikes across an entire AWS region, walk me through how you execute automated DNS failover (Route 53 latency/health routing) while avoiding data inconsistency across active-active cross-region clusters.",
    },
    stage3_architecture: {
      Student:
        "What are the core stages of a continuous integration and continuous deployment (CI/CD) pipeline, and what is the difference between continuous delivery and continuous deployment?",
      "0–2 years":
        "How do you implement secret management in Kubernetes (using HashiCorp Vault, AWS Secrets Manager, or External Secrets Operator) so that production credentials are never committed in plaintext git repositories?",
      "2–5 years":
        "Compare blue-green deployments, canary releases, and rolling updates. Under what circumstances does a canary release fail to catch a breaking database migration?",
      "5+ years":
        "How would you architect an enterprise observability platform (Prometheus, Grafana, OpenTelemetry, Jaeger) handling 20 million metric samples per second with strict retention, cost optimization, and automated anomaly alerting?",
    },
    stage4_collaboration:
      "Tell me about a time when developers wanted to bypass CI/CD security scanning or linting gates to push a critical hotfix to production. How did you balance production urgency with site reliability and security compliance?",
    stage5_companyFit:
      "What is your philosophy on Site Reliability Engineering (SRE) error budgets versus developer feature velocity, and how do you align engineering teams around SLA and SLO commitments?",
  },

  "Embedded Systems Engineer": {
    stage1_basics: {
      Student:
        "In embedded C programming, why is the `volatile` keyword critical when declaring variables shared between an Interrupt Service Routine (ISR) and the main background loop?",
      "0–2 years":
        "What is the difference between memory-mapped I/O and port-mapped I/O in microcontroller architectures? How does the processor access peripheral control and status registers?",
      "2–5 years":
        "Compare the hardware layer and timing characteristics of I2C, SPI, and UART protocols. What are the advantages and drawbacks of SPI's four-wire bus compared to I2C's two-wire bus with pull-up resistors?",
      "5+ years":
        "In hard real-time operating systems (RTOS), what is priority inversion? Explain how Priority Inheritance and Priority Ceiling protocols prevent lower-priority tasks from indefinitely blocking higher-priority tasks.",
    },
    stage2_applied: {
      Student:
        "How do you debounce a mechanical push-button input in an embedded microcontroller using both hardware (RC filter) and software (timer interrupts) approaches?",
      "0–2 years":
        "Walk me through how you configure an analog-to-digital converter (ADC) using Direct Memory Access (DMA) to continuously sample sensor readings without stalling the CPU core.",
      "2–5 years":
        "You have a battery-powered IoT device that must operate for 3 years on a coin cell. What firmware techniques (sleep modes, clock gating, peripheral power domain control) do you use to minimize microamp current draw?",
      "5+ years":
        "An embedded device in the field experiences sporadic watchdog timer resets every few days under heavy RF transmission load. Walk me through your step-by-step debugging methodology using logic analyzers, oscilloscopes, and stack unwind logs.",
    },
    stage3_architecture: {
      Student:
        "What is a Watchdog Timer (WDT), and how does your firmware service it to protect against infinite loops or hardware hangs?",
      "0–2 years":
        "How do you design a circular ring buffer for high-speed UART reception to guarantee zero byte drops during bursts without disabling global interrupts?",
      "2–5 years":
        "How do you implement secure Over-The-Air (OTA) firmware updates with dual-bank flash memory, cryptographic signature verification, and automated fallback on boot failure?",
      "5+ years":
        "How do you architect a safety-critical embedded system (e.g. ISO 26262 automotive or IEC 62304 medical) requiring deterministic fault detection, memory protection units (MPU), and fail-safe state machines?",
    },
    stage4_collaboration:
      "Tell me about a project where you collaborated with hardware and PCB layout engineers when a prototype board exhibited signal integrity issues or power supply noise. How did you isolate firmware bugs from hardware anomalies?",
    stage5_companyFit:
      "What excites you about designing embedded firmware for our hardware products, and what is your approach to automated hardware-in-the-loop (HIL) testing?",
  },

  "Mechanical Design Engineer": {
    stage1_basics: {
      Student:
        "Walk me through the standard engineering stress-strain curve for a ductile material (like mild steel). What are the proportional limit, yield point, ultimate tensile strength, and fracture point?",
      "0–2 years":
        "In solid mechanics, what is the significance of Mohr's Circle, and how do you calculate maximum shear stress and principal normal stresses on an element under combined loading?",
      "2–5 years":
        "Explain the Von Mises yield criterion versus the Tresca criterion. Under what stress states does Von Mises predict yield more accurately for ductile structural alloys?",
      "5+ years":
        "In fracture mechanics and high-cycle fatigue, how do you apply the S-N curve, Goodman diagram, and Miner's Rule for cumulative damage to predict component fatigue life under fluctuating cyclic loads?",
    },
    stage2_applied: {
      Student:
        "What is Geometric Dimensioning and Tolerancing (GD&T)? Explain the difference between MMC (Maximum Material Condition) and LMC (Least Material Condition) when specifying pin and hole fits.",
      "0–2 years":
        "When performing a 1D tolerance stack-up analysis on a machined assembly, how do you decide between worst-case tolerance accumulation and statistical (Root Sum of Squares - RSS) tolerancing?",
      "2–5 years":
        "When setting up a Finite Element Analysis (FEA) simulation for a structural bracket, how do you verify mesh convergence, and how do you identify artificial stress singularities caused by boundary constraints?",
      "5+ years":
        "You need to design an injection-molded plastic enclosure requiring snap fits, uniform wall thickness, rib reinforcement, and draft angles. What specific design rules do you enforce to avoid sink marks, warpage, and weld lines?",
    },
    stage3_architecture: {
      Student:
        "What are the three fundamental modes of heat transfer (conduction, convection, and radiation), and what governing equations describe them?",
      "0–2 years":
        "How do you select between CNC machining, die casting, sheet metal stamping, and additive manufacturing (3D printing) based on production volume, tooling cost, and tolerance requirements?",
      "2–5 years":
        "How do you design thermal management solutions (extruded heat sinks, heat pipes, thermal interface materials) for high-density electronic packaging operating in sealed enclosures?",
      "5+ years":
        "How do you design kinematic linkages or precision drive mechanisms requiring zero backlash, high stiffness, and dynamic vibration isolation under variable operating frequencies?",
    },
    stage4_collaboration:
      "Describe a situation where manufacturing or toolmakers requested design modifications to reduce machining cycle times, but the change risked compromising structural strength. How did you negotiate the design revision?",
    stage5_companyFit:
      "What is your experience with Design for Manufacturing and Assembly (DFMA), and how do you approach rapid physical prototyping during early development stages?",
  },

  "Civil & Structural Engineer": {
    stage1_basics: {
      Student:
        "What is the difference between a Bending Moment Diagram (BMD) and a Shear Force Diagram (SFD)? For a simply supported beam with a uniformly distributed load (UDL), what are the shapes of the SFD and BMD?",
      "0–2 years":
        "In concrete technology, what does concrete grade (e.g. M20, M25, M30) indicate, and how is the slump cone test performed on-site to verify concrete workability and water-cement ratio?",
      "2–5 years":
        "In structural reinforced concrete design, compare the Limit State Method (LSM) against the Working Stress Method (WSM). What are the limit states of collapse versus limit states of serviceability (deflection, cracking)?",
      "5+ years":
        "In geotechnical foundation engineering, explain Terzaghi's bearing capacity theory. How do you assess skin friction versus end-bearing resistance when designing bored cast-in-situ concrete piles in stratified soils?",
    },
    stage2_applied: {
      Student:
        "What is the function of stirrups (shear reinforcement) in reinforced concrete beams, and why are they spaced closer together near the beam supports than at mid-span?",
      "0–2 years":
        "How do you interpret a geotechnical Standard Penetration Test (SPT) soil report, and how do you calculate the safe bearing capacity (SBC) of soil from N-values?",
      "2–5 years":
        "When performing structural analysis on a multi-story building frame using ETABS or STAAD.Pro, how do you model lateral loads from wind and seismic forces (Response Spectrum Method)?",
      "5+ years":
        "A post-tensioned concrete bridge girder or structural transfer slab shows unexpected micro-cracking along anchor zones during tensioning. How do you assess the structural integrity and determine remediation?",
    },
    stage3_architecture: {
      Student:
        "What are the differences between shallow foundations (isolated, combined, raft/mat) and deep foundations (pile, pier, caisson), and when is a raft foundation required?",
      "0–2 years":
        "How do you design expansion joints, construction joints, and waterstops in water-retaining structures to prevent leakage and thermal contraction cracking?",
      "2–5 years":
        "Explain ductile detailing of reinforced concrete structures subjected to seismic forces in accordance with modern earthquake engineering codes (e.g. IS 13920 / ACI 318).",
      "5+ years":
        "How do you manage complex site execution risks involving deep excavation shoring, dewatering in high water-table zones, and structural quality control across multiple subcontractors?",
    },
    stage4_collaboration:
      "Describe a project where architectural aesthetics (such as long column-free spans or irregular cantilever overhangs) conflicted with structural stability or deflection limits. How did you resolve the structural dilemma with the architect?",
    stage5_companyFit:
      "What is your approach to value engineering, sustainable construction materials (fly-ash concrete, GGBS), and ensuring zero-incident site safety on large-scale infrastructure projects?",
  },
};

export class AdaptiveEngineService {
  /**
   * Question 1: Always starts with the fundamentals/basics of the domain,
   * calibrated to candidate's experience level (Student, 0-2 yrs, 2-5 yrs, 5+ yrs).
   * Direct question delivery with ZERO conversational greeting filler.
   */
  generateInitialQuestion(config: InterviewConfig, profile?: CandidateProfile | null): InterviewQuestion {
    const totalQuestions = getStreamQuestionCount(config);
    const expLevel = config.experienceLevel || "2–5 years";

    // If launched from a Course Roadmap Module, lead directly with the module practice prompt
    if (config.practicePrompt) {
      return {
        id: "q-1",
        questionNumber: 1,
        totalQuestions,
        text: config.practicePrompt,
        category: config.moduleTopic || "Domain Fundamentals",
        isFollowUp: false,
      };
    }

    const domainMatrix = realCompanyQuestionMatrix[config.targetRole] || realCompanyQuestionMatrix["Software Engineer"];
    const basicQuestion = domainMatrix.stage1_basics[expLevel] || domainMatrix.stage1_basics["2–5 years"];

    const category =
      config.targetRole === "College Lecturer"
        ? "Pedagogical & Subject Mastery"
        : config.targetRole === "UI Designer"
        ? "Design Fundamentals & Principles"
        : "Domain Fundamentals";

    return {
      id: "q-1",
      questionNumber: 1,
      totalQuestions,
      text: basicQuestion,
      category,
      isFollowUp: false,
    };
  }

  /**
   * Subsequent Questions: Progressively escalate in depth:
   * Q2 -> Applied Problem Solving / Practical Debugging
   * Q3 -> System Architecture, Trade-offs & Production Bottlenecks
   * Q4 -> Real-world Collaboration, Code Reviews & STAR Behavioral
   * Q5+ -> High-Impact Delivery, Company Mission & Alignment
   */
  generateFollowUpQuestion(
    config: InterviewConfig,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string,
    profile?: CandidateProfile | null
  ): InterviewQuestion {
    const totalQuestions = getStreamQuestionCount(config);
    const lowerAnswer = candidateAnswer.toLowerCase().trim();
    const words = lowerAnswer.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const expLevel = config.experienceLevel || "2–5 years";
    const companyName = config.company?.trim() || config.companyType || "our team";
    const domainMatrix = realCompanyQuestionMatrix[config.targetRole] || realCompanyQuestionMatrix["Software Engineer"];

    const isTrivial = wordCount < 6 || lowerAnswer.includes("don't know") || lowerAnswer.includes("idk") || lowerAnswer.includes("no idea");

    // If candidate gives a non-answer or extremely brief response, challenge them constructively
    if (isTrivial) {
      const probingText =
        config.targetRole === "College Lecturer"
          ? `In an academic faculty selection interview at ${companyName}, the committee needs to hear your pedagogical rationale and conceptual clarity. Could you walk me through your initial thoughts on this question, what core principles you would emphasize to students, or how you would structure this concept in a lecture?`
          : config.targetRole === "UI Designer"
          ? `In a design interview at ${companyName}, interviewers need to understand your user-centric reasoning and design thinking process. Could you walk me through your initial thoughts or how you would approach this from an interaction design perspective?`
          : `In a real ${config.targetRole} interview at ${companyName}, interviewers need to hear your step-by-step reasoning even on tough topics. Could you walk me through your initial thoughts on this question, what fundamentals come to mind, or how you would investigate it if encountered on the job?`;

      return {
        id: `q-${questionNumber}`,
        questionNumber,
        totalQuestions,
        text: probingText,
        category: "Constructive Probing",
        isFollowUp: true,
      };
    }

    // Adaptive Stage Progression
    let text = "";
    let category = "Applied Problem Solving";
    let isFollowUp = false;

    if (questionNumber === 2) {
      // Stage 2: Applied problem solving in their domain
      text = domainMatrix.stage2_applied[expLevel] || domainMatrix.stage2_applied["2–5 years"];
      category = "Applied Problem Solving";

      // If candidate's profile has an actual project, tie the question into their project
      if (profile?.projects && profile.projects.length > 0) {
        const proj = profile.projects[0];
        text = `Building on that: In your project "${proj.name}", you worked with ${proj.technologies.slice(0, 3).join(", ")}. ${text} How did that scenario manifest in "${proj.name}" and what was your specific approach?`;
      }
    } else if (questionNumber === 3) {
      // Stage 3: System Architecture, Trade-offs & Production Bottlenecks
      text = domainMatrix.stage3_architecture[expLevel] || domainMatrix.stage3_architecture["2–5 years"];
      category = "Architecture & Trade-offs";
    } else if (questionNumber === 4) {
      // Stage 4: Real-world Collaboration, Code Reviews & STAR Behavioral
      text = domainMatrix.stage4_collaboration;
      category = "Collaboration & Conflict (STAR)";
    } else {
      // Stage 5+: High-Impact Delivery, Company Mission & Alignment
      text = domainMatrix.stage5_companyFit;
      category = "Company Alignment & High-Impact Delivery";
    }

    return {
      id: `q-${questionNumber}`,
      questionNumber,
      totalQuestions,
      text,
      category,
      isFollowUp,
    };
  }
}

export const adaptiveEngine = new AdaptiveEngineService();
