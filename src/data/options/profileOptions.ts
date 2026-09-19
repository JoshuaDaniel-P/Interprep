export const qualificationOptions = [
  "10th",
  "12th",
  "Diploma",
  "ITI",
  "Undergraduate",
  "Postgraduate",
  "Doctorate",
  "Other",
];

export const degreeOptions = [
  "B.Tech",
  "B.E.",
  "B.Sc.",
  "BCA",
  "BBA",
  "B.Com",
  "BA",
  "M.Tech",
  "M.E.",
  "M.Sc.",
  "MCA",
  "MBA",
  "MA",
  "M.Com",
  "PhD",
  "Other",
];

export const specializationOptions: Record<string, string[]> = {
  Engineering: [
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Other",
  ],
  Science: [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Data Science",
    "Other",
  ],
  Management: [
    "Business Administration",
    "Finance",
    "Marketing",
    "Human Resources",
    "Operations",
    "Other",
  ],
  ArtsAndHumanities: [
    "English Literature",
    "Economics",
    "Psychology",
    "Political Science",
    "Communication",
    "Other",
  ],
};

export const categorizedSkills = {
  Programming: ["Python", "Java", "C", "C++", "JavaScript", "TypeScript", "C#", "Go", "Rust", "PHP", "Kotlin", "Swift"],
  Web: ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue", "Next.js", "Node.js", "Tailwind CSS", "REST APIs"],
  Data: ["SQL", "Excel", "Statistics", "Data Analysis", "Machine Learning", "Deep Learning", "Data Visualization", "Power BI", "Tableau", "Pandas"],
  Design: ["UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator", "Design Systems", "Prototyping", "User Research", "Accessibility (a11y)"],
  Management: ["Product Management", "Agile", "Scrum", "Project Management", "Business Analysis", "Market Research", "Product Strategy"],
  CloudDevOps: ["AWS", "Microsoft Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Linux", "Git", "GitHub"],
  Engineering: ["Embedded Systems", "Microcontrollers", "Arduino", "ESP32", "MATLAB", "VLSI", "Verilog", "PCB Design", "IoT", "Signal Processing"],
  Communication: ["Communication Skills", "Business Communication", "Public Speaking", "Leadership", "Presentation Skills"],
};
