# HireSense project instructions

## Product and scope
HireSense is a static, client-side resume-review toolkit for students and early-career developers. It uses transparent JavaScript heuristics and generates editable report drafts. It is not an official ATS, hiring predictor, or production multi-tenant SaaS.

## Stack (do not change without approval)
- Frontend: semantic HTML, CSS, vanilla JavaScript.
- Analysis: pure functions in `analyzer.js`; UI and DOM behavior in `script.js`.
- Persistence: none; resume and job-description text stay in the browser for analysis.
- Backend/database/auth: none by design in the current prototype.
- Hosting target: GitHub Pages static site.
- Tests: Node.js built-in test runner and Playwright Chromium smoke tests.

## Safety and privacy rules
- Never add credentials, private keys, tokens, or real user resume samples to the repository.
- Browser-visible configuration is public; never place a secret in HTML or JavaScript.
- Do not transmit resume or job-description text except where the user explicitly initiates a separately documented feature. The contact form is a separate third-party integration and must fail clearly if not configured.
- Render user-supplied text with textContent or properly escaped text; do not pass untrusted text directly to innerHTML.
- Do not invent metrics, work history, qualifications, ATS compatibility, or hiring outcomes.
- Do not add auth, database, payments, rate limiting, or a server solely to satisfy a checklist when the product has no corresponding backend feature. Document why a layer is not applicable and revisit if product scope changes.

## Working rules
- Work on a feature branch and open/update a PR; never push directly to main.
- Make small, reviewable commits and document architecture decisions in `docs/decisions/`.
- Before claiming a change is complete, run `npm test`, syntax checks, and browser smoke/accessibility tests; show the actual results.
- Inspect changed tests for meaningful assertions; do not weaken tests just to get green CI.
- Do not merge without explicit user approval.
- Ask before adding runtime dependencies. Dev-only test dependencies must be justified and pinned or consistently installed in CI.

## Commands
- Tests: `npm test`
- Syntax: `node --check analyzer.js && node --check script.js`
- Browser smoke: `node tests/browser-smoke.cjs`
- Accessibility: `node tests/accessibility-smoke.cjs`

## Architecture
See `docs/system-design.md`, `docs/architecture.md`, and `docs/decisions/0001-static-client-side-prototype.md`.
