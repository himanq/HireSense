# HireSense system design

## Problem statement
Students and early-career developers need a quick, understandable first-pass review of resume text and practical prompts for improvement. HireSense provides local heuristic checks and editable drafts without claiming to predict hiring outcomes.

## Users and roles
- Primary user: an individual reviewing their own resume.
- Maintainer: project owner who maintains the static site and optional contact-form integration.
- There are no accounts, teams, organizations, or role-based permissions in the current prototype.

## Core workflows
1. Paste resume text and run a heuristic completeness review.
2. Read detected sections, technology terms, and improvement prompts.
3. Optionally paste a job description and compare supported dictionary terms.
4. Generate editable draft content with placeholders rather than invented achievements.
5. Download a Markdown or plain-text report.
6. Optionally contact the maintainer through a separate contact form if that integration is configured and available.

## Functional requirements
- Analysis runs locally in the browser.
- User text is treated as untrusted input.
- Download buttons remain disabled until a successful analysis and produce the requested format.
- Scores and keyword coverage are labelled as heuristic signals, not ATS scores or hiring predictions.
- Suggestions must not fabricate metrics, skills, or work history.
- The page must remain usable on mobile and by keyboard.
- Third-party contact delivery must provide clear failure feedback when unavailable.

## Non-functional requirements
- Static deployment with minimal operational burden and no server-side storage of resume text.
- No authentication, database, billing, file uploads, or background jobs in the current scope.
- Responsive layout including 375px viewport.
- CI runs syntax checks, unit tests, Chromium browser checks, and an automated accessibility audit.
- Keep external requests limited to explicitly documented integrations and optional font loading.

## Privacy and data classification
- Resume and job-description text: potentially sensitive personal data; processed in the page runtime and not stored by HireSense servers.
- Contact-form fields: personal data sent to a third-party form provider only when the user submits the form and the integration is configured.
- No accounts, payment records, or uploaded files are collected by the current product.
- Never use real resume text in automated tests, fixtures, issue reports, or logs.

## Capacity assumptions
- Initial scale target: portfolio/demo usage, low thousands of page views per month; this is a planning assumption, not measured traffic.
- Analysis is local and CPU-bound; static assets are delivered by GitHub Pages/CDN.
- There is no database or uploaded-file storage to size.
- The first likely constraints are static-hosting limits, third-party font availability, and contact-provider availability, not database throughput.

## Availability, failure behavior, and privacy boundaries
- If fonts fail to load, system font fallbacks should keep the site readable.
- If JavaScript fails, the page must not imply that analysis or downloads succeeded.
- If contact delivery is unavailable or unconfigured, show a truthful error and do not claim a message was sent.
- The site should not log resume text or contact form values to the console.

## Out of scope for this prototype
- Accounts, team tenancy, organization isolation, saved resumes, server-side resume storage.
- AI/LLM API calls, ATS vendor integration, employment recommendations.
- Paid plans, payment processing, subscriptions, webhook handlers.
- Uploading or storing resume files.
- Admin dashboard, background jobs, rate limiting, multi-region infrastructure.

## Open questions
- Is the contact form intended to be enabled in production? If yes, configure and verify the provider's public form key and spam protection.
- Should the product remain static, or become a multi-user SaaS? That decision must precede database/auth/backend work.
- If traffic grows beyond the demo target, re-check hosting limits, privacy obligations, and support requirements.
