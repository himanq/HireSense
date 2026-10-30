# 15-layer playbook acceptance checklist

This checklist maps the attached *Vibe Coding a Real SaaS: The 15-Layer Playbook* to HireSense's actual current architecture. Statuses describe evidence in the repository, not a blanket claim of production readiness.

Legend:
- **PASS**: repository evidence or automated test currently supports the claim.
- **PARTIAL**: some work exists; important verification remains.
- **N/A (current scope)**: no matching server-side feature exists by deliberate design.
- **NOT VERIFIED**: the required external/live/manual check has not been performed.

| Layer | Status | Evidence / remaining work |
|---|---|---|
| 1. System design | PARTIAL | `docs/system-design.md` records users, workflows, privacy, capacity assumptions, and out-of-scope items. Product owner must confirm static prototype vs future SaaS scope and contact-form intent. |
| 2. System architecture | PARTIAL | `docs/architecture.md` and ADRs record the static architecture. Live Pages URL and full dependency/supply-chain review remain unverified. |
| 3. Databases & storage | N/A (current scope) | No server-side user/resume storage, uploaded files, or database. Backup decision is documented in `docs/runbooks/backups.md`. Revisit before introducing accounts or saved resumes. |
| 4. Auth & permissions | N/A (current scope) | No accounts or protected resources exist. Must implement server-side auth, authorization, and tenant isolation if multi-user persistence is introduced. |
| 5. APIs & backend logic | N/A (current scope) | No first-party API or backend. Future requirements are documented in `docs/api-conventions.md`. |
| 6. Frontend | PARTIAL | CSS consistency, some semantic markup, form labels, dialog names, focus/reduced-motion rules, and responsive checks exist. Automated axe results, full keyboard/focus management, contrast review, screen-reader review, offline behavior, and actual phone review must pass before claiming complete. |
| 7. CI/CD & version control | PARTIAL | PR-based workflow, tests workflow, and Pages deployment workflow exist. Action versions are not pinned to commit SHAs; secret-history scan, deliberate failing-test branch protection check, deployment rollback drill, and live deployment remain unverified. |
| 8. Testing | PARTIAL | Node unit tests and Chromium smoke tests exist. axe-core audit is configured. CI must run after these latest commits and all findings must be reviewed; more edge cases and manual testing remain. |
| 9. Hosting & cloud | NOT VERIFIED | `docs/hosting.md` and `docs/runbooks/deploy.md` describe GitHub Pages. The repository's Pages settings, HTTPS, actual deployment URL, and live workflow have not been confirmed. |
| 10. Security | PARTIAL | `docs/security/threat-model.md` records surfaces and gaps; unconfigured contact delivery now explicitly falls back to the user's mail app. Full secret scan of Git history, full DOM-sink review, live network inspection, security-header review, and professional audit remain unverified. |
| 11. Rate limiting | N/A (current scope) | No first-party server endpoints or paid API calls. If server APIs or provider-backed generation are added, implement shared-store route-specific limits and abuse controls. |
| 12. Caching & CDN | PARTIAL | Static hosting is intended to provide asset delivery. Actual deployed cache headers, CDN behavior, and performance under traffic have not been measured. |
| 13. Error tracking & logs | PARTIAL | Local error paths show user-facing messages and console errors are limited to exceptions. No external error-tracking service or alerting is configured; evaluate whether appropriate for this static demo. |
| 14. Monitoring & alerts | NOT VERIFIED | No uptime monitor or alerts are configured. Set up external availability checks if the project needs an operational uptime claim. |
| 15. Scaling | NOT VERIFIED | Capacity assumptions are in `docs/system-design.md`; no load or stress test has been run. Test static-hosting limits and contact-provider quotas before making scale claims. |

## Release gate

Do not call this project “SaaS-ready” or “production-ready” solely because CI is green. Before release:
1. Confirm all workflows pass on the latest PR head.
2. Review and resolve serious/critical axe findings; record any justified exceptions.
3. Manually test keyboard navigation and modal focus behavior.
4. Confirm GitHub Pages publishing source, HTTPS, deployment URL, and deployed downloads.
5. Verify the contact fallback and explicitly decide whether the third-party form should be enabled.
6. Run a secret scan over tracked files and Git history.
7. Review all changes and ask for explicit approval before merging.

This checklist does not claim external hosting, manual, penetration, or load checks have passed unless their evidence is recorded here.
