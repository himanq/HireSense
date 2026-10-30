# ADR 0001: Keep HireSense static and client-side

- Status: Accepted for the current prototype
- Date: 2026-10-30

## Context
HireSense currently reviews pasted resume text, compares a job description using a term dictionary, generates editable templates, and downloads a report. These workflows can run entirely in the browser. Resume text is sensitive, so avoiding server transmission is a meaningful privacy advantage.

## Decision
Use vanilla HTML/CSS/JavaScript hosted as static assets. Keep pure analysis functions in `analyzer.js`, UI interactions in `script.js`, and test behavior with Node's built-in test runner plus Playwright/Chromium. Do not introduce a database, auth, backend API, payments, or rate limiting until a real product requirement calls for them.

## Alternatives considered
- Full-stack modular monolith with database and authentication: rejected for now due to extra cost, maintenance, and data-handling risk without current account workflows.
- LLM service for resume feedback: rejected for now because it requires transmitting resume text and managing secrets and usage costs.
- Store resumes locally or remotely: rejected for current scope; the user can keep the report locally.

## Consequences
- Low operational burden and no server-side resume store.
- Static analysis cannot provide personalized semantic reasoning beyond its dictionary/rules.
- Authentication, tenant isolation, API authorization, backups, and rate limiting are not applicable until server-side features exist.
- GitHub Pages security headers and deployment settings must be checked at the hosting layer.
- Revisit this decision before adding accounts, shared resumes, payments, or AI API integration.
