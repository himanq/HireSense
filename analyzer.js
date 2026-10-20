"use strict";

const TECH_MAP = {
  react: "React", "node.js": "Node.js", nodejs: "Node.js", python: "Python",
  java: "Java", javascript: "JavaScript", typescript: "TypeScript", "c++": "C++",
  php: "PHP", golang: "Go", kotlin: "Kotlin", swift: "Swift", flutter: "Flutter",
  android: "Android", mongodb: "MongoDB", mysql: "MySQL", postgresql: "PostgreSQL",
  firebase: "Firebase", redis: "Redis", docker: "Docker", kubernetes: "Kubernetes",
  aws: "AWS", gcp: "GCP", azure: "Azure", git: "Git", linux: "Linux",
  django: "Django", flask: "Flask", express: "Express.js", spring: "Spring Boot",
  html: "HTML/CSS", tailwind: "Tailwind CSS", graphql: "GraphQL",
  tensorflow: "TensorFlow", pytorch: "PyTorch", "machine learning": "Machine Learning"
};

const COMMON_SKILLS = [
  { skill: "Docker", category: "DevOps" },
  { skill: "AWS", category: "Cloud" },
  { skill: "CI/CD", category: "DevOps" },
  { skill: "Automated Testing", category: "Testing" },
  { skill: "TypeScript", category: "Language" },
  { skill: "PostgreSQL", category: "Database" },
  { skill: "System Design", category: "Architecture" },
  { skill: "Git", category: "Tooling" },
  { skill: "Linux / Shell", category: "DevOps" },
  { skill: "Data Structures", category: "CS Fundamentals" }
];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function rewriteBullet(line) {
  const clean = line.replace(/^[-•*▪➤✓→]\s*/, "").trim();
  const rules = [
    [/^(worked on|worked with)\s+/i, "Contributed to "],
    [/^helped\s+/i, "Supported "],
    [/^assisted\s+/i, "Supported "],
    [/^participated in\s+/i, "Contributed to "],
    [/^involved in\s+/i, "Contributed to "],
    [/^was responsible for\s+/i, "Managed "],
    [/^did\s+/i, "Completed "],
    [/^made\s+/i, "Created "]
  ];
  for (const [pattern, replacement] of rules) {
    if (pattern.test(clean)) {
      const rewritten = clean.replace(pattern, replacement);
      return rewritten + " [Add a verified result or metric only if you can substantiate it.]";
    }
  }
  return clean + " [Consider adding a verified outcome, if available.]";
}

/**
 * Transparent, rule-based checks. This is not an ATS vendor score or an
 * employment recommendation; it only checks text signals and section coverage.
 */
function analyzeResume(input) {
  const text = String(input || "").trim();
  const lower = text.toLowerCase();
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const has = phrase => lower.includes(phrase.toLowerCase());
  const hasRx = pattern => pattern.test(text);

  const checks = {
    email: hasRx(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i),
    phone: hasRx(/(?:\+91[\s-]?)?(?:0)?[6-9]\d{9}\b/),
    linkedin: has("linkedin.com") || has("linkedin"),
    github: has("github.com") || has("github"),
    metrics: hasRx(/\b\d+(?:\.\d+)?\s*(?:%|x\b|k\b|users\b|students\b|clients\b|requests\b|downloads\b|ms\b|seconds\b)/i),
    summary: ["summary", "objective", "profile"].some(has),
    experience: ["experience", "internship", "intern", "employment"].some(has),
    education: ["education", "b.tech", "bachelor", "university", "college", "cgpa"].some(has),
    projects: has("project"),
    certifications: has("certification") || has("certifications") || has("certificate")
  };

  const technologies = [];
  // Match complete technology terms so Java does not match JavaScript.
  const normalizedText = " " + lower.replace(/[^a-z0-9+#.]+/g, " ").trim() + " ";
  for (const [needle, label] of Object.entries(TECH_MAP)) {
    const normalizedNeedle = needle.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
    if (normalizedNeedle && normalizedText.includes(" " + normalizedNeedle + " ") &&
        !technologies.includes(label)) technologies.push(label);
  }

  const isML = ["machine learning", "tensorflow", "pytorch", "data science"].some(has);
  const isBackend = ["backend", "node.js", "django", "flask", "spring"].some(has);
  const isFrontend = ["frontend", "react", "angular", "vue", "html"].some(has);
  const isMobile = ["android", "kotlin", "flutter"].some(has);
  const role = isML ? "ML/AI Engineer" : isMobile ? "Mobile Developer" :
    isBackend && isFrontend ? "Full Stack Developer" :
    isBackend ? "Backend Developer" : isFrontend ? "Frontend Developer" : "Software Developer";

  let score = 20;
  if (checks.email) score += 5;
  if (checks.phone) score += 3;
  if (checks.linkedin) score += 5;
  if (checks.github) score += 7;
  if (technologies.length >= 5) score += 10;
  else if (technologies.length >= 2) score += 5;
  if (checks.experience) score += 8;
  if (checks.education) score += 7;
  if (checks.projects) score += 10;
  if (checks.metrics) score += 7;
  if (checks.summary) score += 5;
  if (checks.certifications) score += 3;
  if (wordCount >= 180 && wordCount <= 750) score += 5;
  if (wordCount < 80) score -= 5;
  score = clamp(score, 10, 95);

  const subScores = {
    keywords: clamp(25 + technologies.length * 5 + (checks.metrics ? 10 : 0) + (checks.github ? 8 : 0)),
    formatting: clamp(25 + (checks.summary ? 15 : 0) + (checks.education ? 15 : 0) +
      (checks.experience ? 15 : 0) + (checks.projects ? 15 : 0) + (lines.length > 10 ? 10 : 0)),
    readability: clamp(25 + (wordCount >= 180 && wordCount <= 750 ? 25 : 0) +
      (checks.projects ? 15 : 0) + (checks.certifications ? 10 : 0) +
      (lines.length >= 8 ? 10 : 0))
  };

  const mistakes = [];
  let id = 1;
  if (!checks.email) mistakes.push({ id: id++, text: "No email address detected. Add a professional contact email if appropriate.", severity: "high" });
  if (!checks.github) mistakes.push({ id: id++, text: "No GitHub or portfolio reference detected. Link relevant work you can explain.", severity: "medium" });
  if (!checks.summary) mistakes.push({ id: id++, text: "No summary or objective heading detected. Consider a short, role-specific introduction.", severity: "medium" });
  if (!checks.projects) mistakes.push({ id: id++, text: "No projects section detected. Add projects you personally built and can discuss.", severity: "high" });
  if (!checks.metrics) mistakes.push({ id: id++, text: "No measurable outcomes detected. Add numbers only when you can verify them.", severity: "medium" });
  if (wordCount < 120) mistakes.push({ id: id++, text: "The text is quite short. Check whether relevant education, projects, skills, or experience are missing.", severity: "medium" });
  if (wordCount > 900) mistakes.push({ id: id++, text: "The text is lengthy. Remove repetition and keep the most role-relevant details.", severity: "low" });

  const headingPattern = /^(education|experience|skills|projects|contact|certifications?|awards|summary|objective|profile|achievements?)\b/i;
  const bulletCandidates = lines.filter(line => {
    const clean = line.replace(/^[-•*▪➤✓→]\s*/, "");
    return clean.length > 24 && clean.length < 220 &&
      clean.split(/\s+/).length >= 5 && !headingPattern.test(clean);
  });

  const improvedBullets = bulletCandidates.slice(0, 3).map(line => ({
    original: line.replace(/^[-•*▪➤✓→]\s*/, "").slice(0, 120),
    improved: rewriteBullet(line)
  }));

  const missingSkills = COMMON_SKILLS
    .filter(item => !has(item.skill.toLowerCase().split(" ")[0]))
    .slice(0, 6);

  const tips = [];
  if (!checks.metrics) tips.push("Add a concrete outcome only when you can support it with evidence; never invent percentages, users, or performance figures.");
  if (!checks.github) tips.push("Add a working GitHub or portfolio link for projects relevant to the role.");
  if (!checks.summary) tips.push("Write a 2–3 line summary aligned to the role, using only skills and experience you can demonstrate.");
  if (!checks.projects) tips.push("Describe one or two projects: the problem, your contribution, the stack, and a verified result.");
  tips.push("Use consistent headings, readable text, and a simple single-column layout where practical.");
  tips.push("Treat suggested skills as research prompts, not skills to claim without practice.");

  const firstLine = lines[0] || "Candidate";
  const name = firstLine.length < 60 ? firstLine : "Candidate";
  return {
    atsScore: score,
    subScores,
    mistakes: mistakes.slice(0, 6),
    improvedBullets,
    missingSkills,
    tips: tips.slice(0, 5),
    _meta: { name, role, techs: technologies, checks, wordCount }
  };
}


const JD_TERMS = [
  ...Object.keys(TECH_MAP),
  "frontend", "front end", "backend", "back end", "full stack", "rest api",
  "unit testing", "integration testing", "problem solving", "data structures",
  "algorithms", "object oriented programming", "oop", "communication",
  "teamwork", "agile", "debugging", "accessibility", "responsive design",
  "sql", "nosql", "api", "internship", "computer science", "machine learning",
  "data analysis", "data analytics", "excel", "power bi", "tableau"
];

function containsTerm(text, term) {
  const normalize = value => " " + String(value).toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ").trim().replace(/\\s+/g, " ") + " ";
  return normalize(text).includes(normalize(term));
}

/**
 * Compare resume text with a supplied job description using a transparent
 * dictionary of technical and role terms. This is not an ATS simulation.
 */
function compareResumeToJob(resumeInput, jobDescriptionInput) {
  const resume = String(resumeInput || "").trim();
  const jobDescription = String(jobDescriptionInput || "").trim();
  const empty = { coverage: 0, matched: [], missing: [], detected: [], totalTerms: 0,
    message: "Paste a resume and a job description to compare relevant terms." };
  if (!resume || !jobDescription) return empty;

  const terms = [];
  for (const term of JD_TERMS) {
    if (containsTerm(jobDescription, term) && !terms.some(existing => existing.toLowerCase() === term.toLowerCase())) {
      terms.push(term);
    }
  }
  const detected = terms.filter(term => containsTerm(resume, term));
  const missing = terms.filter(term => !containsTerm(resume, term));
  const matched = detected.map(term => TECH_MAP[term] || term.replace(/\b\w/g, char => char.toUpperCase()));
  const missingLabels = missing.map(term => TECH_MAP[term] || term.replace(/\b\w/g, char => char.toUpperCase()));
  return {
    coverage: terms.length ? Math.round((detected.length / terms.length) * 100) : 0,
    matched,
    missing: missingLabels,
    detected: terms,
    totalTerms: terms.length,
    message: terms.length
      ? "Dictionary-based term overlap only. A missing term is a prompt to review—not a skill to claim."
      : "No supported role or technology terms were detected in this job description. Review it manually."
  };
}

function generateProReport(input, analysis) {
  const text = String(input || "").trim();
  const data = analysis || analyzeResume(text);
  const meta = data._meta || {};
  const name = meta.name || "Candidate";
  const skills = (meta.techs || []).slice(0, 8);
  const skillList = skills.length ? skills.join(", ") : "[Add skills you can demonstrate]";
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const bulletSuggestions = (data.improvedBullets || [])
    .map(item => "• " + item.improved).join("\n");

  const rewrittenResume = [
    name,
    "[Keep only the contact links and details that are correct.]",
    "",
    "PROFESSIONAL SUMMARY",
    "[Write 2–3 lines about your target role, strongest verified skills, and relevant work.]",
    "",
    "SKILLS",
    skillList,
    "",
    "PROJECTS & EXPERIENCE",
    bulletSuggestions || "[Add 1–3 concise bullets describing work you personally completed.]",
    "",
    "EDUCATION",
    "[Degree / institution / graduation year / grade, if relevant]",
    "",
    "CERTIFICATIONS & ADDITIONAL DETAILS",
    "[Include only current, verifiable items relevant to the role.]",
    "",
    "ORIGINAL RESUME TEXT (for reference)",
    lines.join("\n")
  ].join("\n");

  const coverLetter = [
    "Dear [Hiring Manager / Team],",
    "",
    "I am applying for the [Role] position at [Company]. My background includes work with " +
      skillList + ".",
    "",
    "One relevant example is [describe a project or experience you personally completed, your specific contribution, and the outcome you can verify].",
    "",
    "I am interested in this opportunity because [give a genuine, role-specific reason]. I would welcome the chance to discuss how my experience aligns with the team's needs.",
    "",
    "Regards,",
    name === "Candidate" ? "[Your name]" : name,
    "[Your contact details]"
  ].join("\n");

  const jdVersions = [
    {
      role: "Product-focused engineering role",
      summary: "Use this checklist to tailor your resume to a real job description; it is not an automated job-description match.",
      keyChanges: [
        "Mirror relevant terms from the actual job post where they accurately describe your experience.",
        "Lead with the most relevant project and explain your individual contribution.",
        "Add a working demo or repository link if available."
      ]
    },
    {
      role: "Backend / platform role",
      summary: "Emphasize engineering fundamentals only where your project or experience provides evidence.",
      keyChanges: [
        "Describe API design, data storage, error handling, and trade-offs you implemented.",
        "Mention testing and performance results only when measured.",
        "Be ready to explain architecture and failure cases."
      ]
    },
    {
      role: "Internship / entry-level role",
      summary: "Show learning through concrete coursework, projects, and collaboration instead of unsupported claims.",
      keyChanges: [
        "List the stack and what you personally implemented.",
        "Include relevant coursework or certifications you completed.",
        "Link source code and state what is unfinished or planned."
      ]
    }
  ];

  return {
    rewrittenResume,
    coverLetter,
    jdVersions,
    linkedinHeadline: "[Target role] | " + skillList + " | Open to relevant opportunities",
    linkedinSummary: [
      "I am building my skills in " + skillList + ".",
      "",
      "I am interested in [target role/domain] and enjoy working on [problem area].",
      "",
      "Selected work: [link one project and explain your contribution].",
      "",
      "I am open to learning, feedback, and relevant opportunities."
    ].join("\n")
  };
}

if (typeof window !== "undefined") {
  window.HireSenseAnalyzer = { analyzeResume, generateProReport, rewriteBullet, compareResumeToJob };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { analyzeResume, generateProReport, rewriteBullet, compareResumeToJob };
}
