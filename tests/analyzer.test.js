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

test("long and HTML-like user text is treated as text by the analyzer", () => {
  const result = analyzeResume("<script>alert('x')</script> ".repeat(40));
  assert.ok(result.atsScore >= 0 && result.atsScore <= 100);
  assert.ok(Array.isArray(result.mistakes));
});