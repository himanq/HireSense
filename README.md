# HireSense

**A browser-based resume review toolkit for students and early-career developers.**

![Language](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=111111)
![Runtime](https://img.shields.io/badge/runtime-static%20site-0f766e)
![Tests](https://img.shields.io/badge/tests-Node.js%20built--in-43853d)

HireSense checks resume text for common completeness signals, suggests fact-preserving bullet edits, and generates editable resume, cover-letter, and profile templates. The current version uses transparent JavaScript heuristics; it does **not** call an LLM, connect to an ATS vendor, or predict interview outcomes.

## Features

- Heuristic review score with keyword, section-coverage, and content-signal breakdowns.
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

## Run tests

Install Node.js 20 or later, then run:

```bash
npm test
```

The tests exercise the pure analysis/report functions in `analyzer.js`. GitHub Actions runs the same suite on pushes and pull requests.

## Project structure

```text
.
├── index.html
├── style.css
├── script.js          # UI interactions and DOM rendering
├── analyzer.js        # Pure rule-based checks and report templates
├── package.json
└── tests/
    └── analyzer.test.js
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

## Roadmap

- Add role-description keyword comparison with clear matching/missing term explanations.
- Add downloadable plain-text/Markdown reports.
- Improve automated accessibility and cross-browser checks.

## Contributing

Issues and pull requests are welcome. Please include a reproduction example for behavior changes and run `npm test` before opening a pull request.