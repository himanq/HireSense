"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8" };
function serve() {
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
    catch { res.writeHead(400).end("Bad request"); return; }
    const requested = pathname === "/" ? "/index.html" : pathname;
    const file = path.resolve(root, "." + requested);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end("Forbidden"); return; }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404).end("Not found"); return; }
      res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({server, url:`http://127.0.0.1:${server.address().port}`})));
}
(async () => {
  let server, browser;
  try {
    const started = await serve(); server = started.server;
    browser = await chromium.launch({headless:true});
    const page = await browser.newPage({viewport:{width:1280,height:900}});
    await page.route("https://fonts.googleapis.com/**", route => route.abort());
    await page.route("https://fonts.gstatic.com/**", route => route.abort());
    await page.goto(started.url, {waitUntil:"domcontentloaded"});
    await page.addScriptTag({path:require.resolve("axe-core/axe.min.js")});
    const results = await page.evaluate(async () => await axe.run(document, {
      runOnly: {type:"tag", values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa","best-practice"]}
    }));
    const violations = results.violations.map(v => ({
      id:v.id, impact:v.impact, description:v.help,
      nodes:v.nodes.map(n => ({target:n.target, summary:n.failureSummary})).slice(0,4)
    }));
    for (const v of violations) console.log(`${v.impact?.toUpperCase() || "UNKNOWN"} ${v.id}: ${v.description}; affected: ${v.nodes.map(n => n.target.join(" ")).join(", ")}`);
    const blockers = violations.filter(v => ["critical","serious"].includes(v.impact));
    if (blockers.length) {
      console.error(JSON.stringify(blockers, null, 2));
      process.exitCode = 1;
    } else {
      console.log(`PASS axe-core: no critical/serious violations; ${violations.length} lower-impact finding(s) need review.`);
    }
  } catch (error) { console.error("FAIL accessibility audit:", error); process.exitCode = 1; }
  finally { if (browser) await browser.close(); if (server) { server.closeAllConnections?.(); await new Promise(resolve => server.close(resolve)); } }
})();
