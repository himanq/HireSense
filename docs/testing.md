# Testing strategy

## Automated layers
- Syntax: `node --check analyzer.js && node --check script.js`.
- Unit: `npm test` exercises deterministic analysis, term matching, report generation, input boundaries, and selected HTML/CSS wiring invariants.
- Browser smoke: Playwright/Chromium verifies page load, desktop/mobile download controls, analysis unlock, Markdown/TXT download events and filenames, and uncaught page errors.
- Accessibility: axe-core scans the page for WCAG 2.1 A/AA and WCAG 2.2 A/AA rules in Chromium. Any exclusions must be documented with rationale; don't silently suppress violations.

## Manual release checks
- Test at 375px mobile and a desktop viewport.
- Use keyboard only: navigate to analyzer, paste text, run analysis, compare a job description, download reports, open and close modals.
- Verify the site still has a usable fallback when Google Fonts is blocked.
- Turn off network after initial load and confirm local analysis/downloads work; external fonts and contact submission may be unavailable.
- Verify contact form success/failure against a configured provider without using sensitive data.
- Confirm the deployed Pages URL and test analysis and downloads after deployment.
- Review changed tests to ensure they exercise real behavior rather than only source-code patterns.

## Current gaps
- No database/API/auth integration tests are applicable to the current static architecture.
- No multi-browser matrix beyond Chromium is currently automated.
- A true screen-reader/manual WCAG review remains required.
- The deployed GitHub Pages build and hosting settings must be checked separately from branch CI.
- Do not claim a production accessibility or security certification from automated scans alone.
