# HireSense

**A browser-based resume review toolkit for students and early-career developers.**

![Language](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=111111)
![Runtime](https://img.shields.io/badge/runtime-static%20site-0f766e)
![Tests](https://img.shields.io/badge/tests-Node.js%20built--in-43853d)

HireSense checks resume text for common completeness signals, suggests fact-preserving bullet edits, and generates editable resume, cover-letter, and profile templates. The current version uses transparent JavaScript heuristics; it does **not** call an LLM, connect to an ATS vendor, or predict interview outcomes.

## Features

- Resume signal score with keyword, section-coverage, and content-signal breakdowns (not an ATS score).
- Job-description term comparison showing detected overlap and missing supported terms; this is dictionary matching, not an ATS simulation.
- Downloadable Markdown and plain-text review reports, including optional job comparison and generated drafts.
- Checks for contact details, common sections, skills, and measurable outcomes.
- Bullet suggestions that preserve the original claim and ask for verified outcomes instead of inventing metrics.
- An expanded resume structure, cover-letter template, and role-tailoring checklists with explicit placeholders.
- Client-side analysis: the resume text is not submitted by the analysis functions to a server.
- Responsive, static HTML/CSS/JavaScript. No build tool is required.

## Run locally

Open `index.html` in a modern browser, or serve the folder with a local static server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Playbook and readiness notes

The [15-layer acceptance checklist](docs/15-layer-checklist.md) maps the attached SaaS playbook to this repository and clearly marks what is partial, not verified, or not applicable to the current static prototype. See `docs/system-design.md`, `docs/architecture.md`, `docs/security/threat-model.md`, and `docs/runbooks/` for the supporting decisions and operational steps.

## Run tests

Install Node.js 20 or later, then run:

```bash
npm test
```

The Node test suite exercises the pure analysis/report functions and includes regression checks for key usability fixes. GitHub Actions runs syntax checks, unit tests, Chromium browser smoke tests, and an axe-core accessibility audit on pushes and pull requests. Browser checks cover desktop/mobile report-download visibility, analysis unlock behavior, file downloads, and uncaught page errors. Automated accessibility checks are a regression aid, not a substitute for keyboard, screen-reader, or real-device review.

## Project structure

```text
.
├── index.html
├── style.css
├── script.js          # UI interactions and DOM rendering
├── analyzer.js        # Pure rule-based checks and report templates
├── package.json
├── AGENTS.md
├── docs/
│   ├── system-design.md
│   ├── architecture.md
│   ├── 15-layer-checklist.md
│   ├── testing.md
│   ├── hosting.md
│   ├── api-conventions.md
│   ├── security/threat-model.md
│   ├── decisions/
│   └── runbooks/
└── tests/
    ├── analyzer.test.js
    ├── browser-smoke.cjs
    └── accessibility-smoke.cjs
```

## Privacy notes

- Resume analysis and report generation run in the browser in this version.
- The optional contact form uses Web3Forms to send contact-form fields. Do not put sensitive information in the contact message.
- This project does not need a resume upload, account, or API key for analysis.

## Limitations

- The score is a small heuristic checklist, not an official ATS score, a calibrated probability, or a hiring recommendation.
- Keyword detection is literal and can miss synonyms, context, and skills written in unexpected formats.
- Suggestions are templates. Review every line and replace bracketed placeholders with accurate details before using them.
- Only add skills you can demonstrate. Never add unverified metrics, experience, users, uptime, or impact.
- Do not use this prototype to rank or automatically reject candidates.

## Usability and accessibility

- One primary navigation landmark; the resume textarea has a visible label.
- Feature cards use semantic heading levels and decorative icons are hidden from assistive technology.
- Shared type and radius tokens improve consistency; body copy and feature icons have readable minimum sizes.
- Mobile-specific hero and report-download layouts; visible keyboard focus and reduced-motion support.
- The score remains a heuristic signal—not an ATS prediction or hiring recommendation.

## Roadmap

- Expand browser coverage to additional viewport sizes and browsers.
- Verify the deployed GitHub Pages build separately from branch-level tests.

## Contributing

Issues and pull requests are welcome. Please include a reproduction example for behavior changes and run `npm test` before opening a pull request.