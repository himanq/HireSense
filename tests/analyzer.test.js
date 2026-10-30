"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { analyzeResume, generateProReport } = require("../analyzer.js");

test("empty input returns a bounded score and actionable issues", () => {
  const result = analyzeResume("");
  assert.ok(result.atsScore >= 0 && result.atsScore <= 100);
  assert.ok(result.mistakes.length > 0);
  assert.deepEqual(result.improvedBullets, []);
});

test("detects relevant sections and technologies without throwing", () => {
  const resume = [
    "Himanshu Dixit",
    "himanshu@example.com | GitHub: https://github.com/himanq",
    "SUMMARY",
    "Computer science student interested in backend engineering and Python.",
    "EDUCATION",
    "B.Tech in Computer Science",
    "PROJECTS",
    "Worked on a Python project that reads records and validates input data.",
    "SKILLS",
    "Python, Java, Git, SQL",
  ].join("\n");
  const result = analyzeResume(resume);
  assert.ok(result._meta.checks.email);
  assert.ok(result._meta.checks.github);
  assert.ok(result._meta.checks.projects);
  assert.ok(result._meta.techs.includes("Python"));
  assert.ok(result.atsScore >= 0 && result.atsScore <= 100);
});

test("technology detection matches complete terms instead of substrings", () => {
  const jsOnly = analyzeResume("Skills\nJavaScript");
  assert.ok(jsOnly._meta.techs.includes("JavaScript"));
  assert.ok(!jsOnly._meta.techs.includes("Java"));

  const javaOnly = analyzeResume("Skills\nJava");
  assert.ok(javaOnly._meta.techs.includes("Java"));
  assert.ok(!javaOnly._meta.techs.includes("JavaScript"));

  const node = analyzeResume("Skills\nNode.js and C++");
  assert.ok(node._meta.techs.includes("Node.js"));
  assert.ok(node._meta.techs.includes("C++"));
});

test("repeating the same skill does not inflate the score", () => {
  const once = analyzeResume("Skills\nPython");
  const repeated = analyzeResume("Skills\nPython Python Python Python Python Python");
  assert.equal(repeated.atsScore, once.atsScore);
  assert.deepEqual(repeated._meta.techs, once._meta.techs);
});

test("analysis is deterministic and scores stay within documented bounds", () => {
  const samples = [
    "",
    "Python JavaScript",
    "EDUCATION\nB.Tech\nPROJECTS\nBuilt a small app.",
    "SKILLS\nJava, C++, Node.js, Docker, AWS, Git"
  ];
  for (const sample of samples) {
    const first = analyzeResume(sample);
    const second = analyzeResume(sample);
    assert.deepEqual(second, first);
    assert.ok(first.atsScore >= 10 && first.atsScore <= 95);
    for (const value of Object.values(first.subScores)) {
      assert.ok(value >= 0 && value <= 100);
    }
  }
});

test("bullet suggestions do not fabricate achievements or metrics", () => {
  const resume = "Projects\nWorked on a Python dashboard and fixed input validation issues.";
  const result = analyzeResume(resume);
  assert.equal(result.improvedBullets.length, 1);
  const suggestion = result.improvedBullets[0].improved;
  assert.match(suggestion, /Contributed to/i);
  assert.match(suggestion, /verified/i);
  assert.doesNotMatch(suggestion, /35%|40%|200\+ users|500\+|99\.9%|10k\+/i);
});

test("expanded report uses placeholders instead of inventing work history", () => {
  const text = "Himanshu Dixit\nPython\nProjects\nWorked on a Python dashboard.";
  const report = generateProReport(text, analyzeResume(text));
  assert.match(report.coverLetter, /\[Role\]/);
  assert.match(report.coverLetter, /\[Company\]/);
  assert.match(report.rewrittenResume, /Original Resume Text/i);
  assert.doesNotMatch(report.rewrittenResume, /99\.9% uptime|10k\+ daily requests|500\+ active users/i);
  assert.match(report.linkedinSummary, /\[target role\/domain\]/i);
});

test("report output always contains the expected sections", () => {
  const resume = "Skills\nPython\nProjects\nBuilt a small dashboard.";
  const report = generateProReport(resume, analyzeResume(resume));
  assert.equal(typeof report.rewrittenResume, "string");
  assert.equal(typeof report.coverLetter, "string");
  assert.equal(typeof report.linkedinSummary, "string");
  assert.ok(report.rewrittenResume.length > 0);
  assert.ok(report.coverLetter.length > 0);
  assert.ok(report.linkedinSummary.length > 0);
});

test("non-string and unusual input values do not crash analysis", () => {
  for (const value of [null, undefined, 0, 42, {}, ["Python", "Projects"]]) {
    const result = analyzeResume(value);
    assert.ok(result.atsScore >= 0 && result.atsScore <= 100);
    assert.ok(Array.isArray(result.mistakes));
    assert.ok(result.subScores && typeof result.subScores === "object");
  }
});

test("long and HTML-like user text is treated as text by the analyzer", () => {
  const result = analyzeResume("<script>alert('x')</script> ".repeat(40));
  assert.ok(result.atsScore >= 0 && result.atsScore <= 100);
  assert.ok(Array.isArray(result.mistakes));
});

test("job-description comparison identifies overlap and gaps without claiming ATS compatibility", () => {
  const { compareResumeToJob } = require("../analyzer.js");
  const resume = "Skills\nJavaScript, React, Git\nProjects\nBuilt a responsive frontend.";
  const jd = "Frontend internship requiring JavaScript, React, TypeScript, Git, and teamwork.";
  const result = compareResumeToJob(resume, jd);
  assert.ok(result.matched.includes("JavaScript"));
  assert.ok(result.matched.includes("React"));
  assert.ok(result.missing.includes("TypeScript"));
  assert.ok(result.missing.includes("Teamwork"));
  assert.equal(result.totalTerms, 7);
  assert.equal(result.coverage, 57);
  assert.match(result.message, /not a skill to claim/i);
});

test("job-description comparison handles empty inputs and unsupported descriptions", () => {
  const { compareResumeToJob } = require("../analyzer.js");
  assert.equal(compareResumeToJob("", "React developer").coverage, 0);
  const result = compareResumeToJob("Python projects", "Looking for a motivated and curious person.");
  assert.equal(result.totalTerms, 0);
  assert.match(result.message, /review it manually/i);
});


test("download report includes limitations and optional job comparison", () => {
  const { buildDownloadReport } = require("../analyzer.js");
  const report = buildDownloadReport("React developer resume", {
    atsScore: 72, mistakes: ["Add measurable project outcomes."]
  }, {
    coverage: 50, matched: ["React"], missing: ["TypeScript"],
    message: "Dictionary-based term overlap only."
  }, null);
  assert.match(report, /Resume signal score: 72\/100/);
  assert.match(report, /React/);
  assert.match(report, /TypeScript/);
  assert.match(report, /not skills to claim/i);
  assert.match(report, /Not an official ATS score/i);
});

test("download report includes draft sections when a report is supplied", () => {
  const { buildDownloadReport } = require("../analyzer.js");
  const report = buildDownloadReport("Resume", { atsScore: 50, mistakes: [] }, null, {
    rewrittenResume: "Resume draft text", coverLetter: "Cover letter text",
    linkedinHeadline: "Headline", linkedinSummary: "Summary",
    jdVersions: [{ role: "Frontend Developer", summary: "Focus on UI work.", keyChanges: ["Explain React project."] }]
  });
  assert.match(report, /Resume draft text/);
  assert.match(report, /Cover letter text/);
  assert.match(report, /Frontend Developer/);
});


test("download controls are present, responsive, and wired to report generation", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");
  const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

  assert.match(html, /class="report-download-actions analyzer-download-actions"/);
  assert.match(html, /id="downloadMarkdownBtn"[^>]*onclick="downloadHireSenseReport\('md'\)"/);
  assert.match(html, /id="downloadTextBtn"[^>]*onclick="downloadHireSenseReport\('txt'\)"/);
  assert.match(html, /id="downloadHint"/);

  assert.match(css, /\.report-download-actions\s*\{[^}]*display\s*:\s*flex/s);
  assert.match(css, /\.download-button-row\s*\{[^}]*display\s*:\s*flex/s);
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.download-button-row\s*\{\s*flex-direction:\s*column/s);
  assert.match(css, /\.download-button-row\s*\.btn\s*\{\s*width:\s*100%/s);

  assert.match(script, /function downloadHireSenseReport\(format\)/);
  assert.match(script, /\["downloadMarkdownBtn",\s*"downloadTextBtn"\][\s\S]*?button\.disabled\s*=\s*false/s);
  assert.match(script, /downloadHint[\s\S]*?Your report is ready/s);
});


test("theme tokens are centralized and accessibility fallbacks are present", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");

  assert.equal((css.match(/:root\s*\{/g) || []).length, 1, "theme tokens should have one source of truth");
  assert.match(css, /--bg:\s*#090a0d/i);
  assert.match(css, /--blue:\s*#c5f36b/i);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});


test("usability audit fixes: one navigation landmark, visible resume label, semantic feature headings and readable type", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");

  assert.equal((html.match(/<nav\\b/gi) || []).length, 1, "page should have a single navigation landmark");
  assert.match(html, /<label[^>]+for="resumeInput"[^>]*>RESUME TEXT<\\/label>/);
  assert.equal((html.match(/class="feat-icon[^"]*" aria-hidden="true"/g) || []).length, 6);
  assert.equal((html.match(/<h4>Resume Completeness Score|<h4>Fact-Preserving Suggestions|<h4>Skill visibility|<h4>Clear next steps|<h4>Editable career assets|<h4>Client-side analysis/g) || []).length, 0);
  assert.match(css, /\.hero-title\\s*\\{[^}]*font-size:\\s*clamp\\(2\\.25rem,\\s*4\\.8vw,\\s*3\\.6rem\\)/s);
  assert.match(css, /\.hero-sub\\s*\\{[^}]*font-size:\\s*clamp\\(1rem,\\s*1\\.45vw,\\s*1\\.125rem\\)/s);
  assert.match(css, /\.feat-icon\\s*\\{[^}]*width:\\s*48px/s);
  assert.match(css, /--radius-sm:\\s*8px/);
  assert.match(css, /--type-base:\\s*16px/);
  assert.match(css, /@media\\s*\\(max-width:\\s*768px\\)/);
});
