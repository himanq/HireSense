"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const mimeTypes = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon" };
function startServer() {
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
    catch { res.writeHead(400).end("Bad request"); return; }
    const requested = pathname === "/" ? "/index.html" : pathname;
    const filePath = path.resolve(root, "." + requested);
    if (!filePath.startsWith(root + path.sep) && filePath !== path.join(root, "index.html")) { res.writeHead(403).end("Forbidden"); return; }
    fs.readFile(filePath, (error, data) => {
      if (error) { res.writeHead(404).end("Not found"); return; }
      res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}
(async () => {
  let server, browser;
  try {
    const started = await startServer(); server = started.server;
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ acceptDownloads: true });
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.setViewportSize({ width:1280, height:900 });
    await page.goto(started.url, { waitUntil:"networkidle" });
    const mdButton = page.locator("#downloadMarkdownBtn"), txtButton = page.locator("#downloadTextBtn");
    await mdButton.waitFor({ state:"visible" }); await txtButton.waitFor({ state:"visible" });
    assert.equal(await mdButton.isDisabled(), true, "Markdown should be locked before analysis");
    assert.equal(await txtButton.isDisabled(), true, "TXT should be locked before analysis");
    console.log("PASS desktop: both download controls visible and initially disabled");
    await page.setViewportSize({ width:390, height:844 });
    assert.equal(await mdButton.isVisible(), true); assert.equal(await txtButton.isVisible(), true);
    const mdBox = await mdButton.boundingBox(), txtBox = await txtButton.boundingBox();
    assert.ok(mdBox && txtBox && mdBox.width > 0 && txtBox.width > 0, "Mobile buttons need measurable non-zero layout");
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(pageWidth <= 390, `Mobile page should not overflow horizontally (scrollWidth=${pageWidth})`);
    console.log("PASS mobile: download controls visible and no horizontal page overflow");
    const resume = [
      "Himanshu Dixit", "Email: himanshu@example.com | Phone: 9876543210", "SUMMARY",
      "Computer Science student interested in frontend and software development.", "EDUCATION",
      "B.Tech in Computer Science Engineering", "PROJECTS",
      "Built a resume review web project using JavaScript and HTML.",
      "Created a responsive interface and tested core functions.", "SKILLS",
      "Java, Python, SQL, HTML, CSS, JavaScript, Git", "EXPERIENCE", "Academic projects and coursework"
    ].join("\n");
    await page.locator("#resumeInput").fill(resume);
    await page.locator("#analyzeBtn").click();
    await page.waitForFunction(() => {
      const md=document.querySelector("#downloadMarkdownBtn"), txt=document.querySelector("#downloadTextBtn");
      return md && txt && !md.disabled && !txt.disabled;
    }, null, { timeout:10000 });
    assert.equal(await mdButton.isDisabled(), false); assert.equal(await txtButton.isDisabled(), false);
    console.log("PASS analysis: sample resume unlocks both report formats");
    const [mdDownload] = await Promise.all([page.waitForEvent("download", { timeout:5000 }), mdButton.click()]);
    assert.equal(mdDownload.suggestedFilename(), "hiresense-resume-review.md");
    const [txtDownload] = await Promise.all([page.waitForEvent("download", { timeout:5000 }), txtButton.click()]);
    assert.equal(txtDownload.suggestedFilename(), "hiresense-resume-review.txt");
    console.log("PASS downloads: Markdown and TXT download events use expected filenames");
    assert.equal(await page.locator("label[for=resumeInput]").count(), 1, "Resume input must have a visible label");
    assert.equal(await page.locator("label[for=jobDescriptionInput]").count(), 1, "Job description input must have a visible label");
    await page.locator("button[onclick=\"openModal(\\u0027contactModal\\u0027)\"]").first().click().catch(() => {});
    assert.equal(await page.locator("label[for=cName]").count(), 1, "Contact name must have a label");
    assert.equal(await page.locator("label[for=cEmail]").count(), 1, "Contact email must have a label");
    assert.equal(await page.locator("label[for=cMsg]").count(), 1, "Contact message must have a label");
    console.log("PASS labels: resume, job description, and contact fields have associated labels");
    assert.deepEqual(pageErrors, [], "No uncaught browser JavaScript errors expected");
    console.log("PASS runtime: no uncaught JavaScript errors");
  } catch (error) { console.error("FAIL browser smoke tests:", error); process.exitCode = 1; }
  finally { if (browser) await browser.close(); if (server) await new Promise(resolve => server.close(resolve)); }
})();
