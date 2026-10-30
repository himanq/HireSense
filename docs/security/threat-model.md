# HireSense threat model

## Scope and assets
- Resume and job-description text entered by a user (sensitive personal information).
- Generated report and draft content.
- Contact form name, email, and message if submitted.
- Repository integrity and deployment workflow.

## Entry points and threats
| Entry point / asset | Threat | Likelihood / impact | Current mitigations | Gaps / actions |
|---|---|---|---|---|
| Resume textarea | Malicious markup / XSS | Medium / High | Analysis functions treat input as text; escaping helper exists | Audit every DOM sink; automated malicious-input browser test; prefer textContent and DOM APIs |
| Job description textarea | Malicious markup / XSS | Medium / High | Comparison code creates result nodes and uses textContent | Keep this pattern and test payloads |
| Report downloads | Unexpected content / incorrect export | Low / Medium | Plain text/Markdown Blob and fixed filenames | Test empty input, unusual Unicode and large input |
| Contact form | Spam, personal-data disclosure, provider outage | Medium / Medium | Explicit user submission; network failure caught | Public provider key currently blank; don't claim working delivery; add honeypot/rate controls at provider/backend if enabled |
| Client JS and HTML | Publicly exposed secrets | Medium / High | No backend secrets are required for analysis | Scan tracked files/history; owner email and public IDs are not secrets but are personal/public configuration |
| GitHub Actions | Supply-chain or over-privileged workflow | Medium / High | GitHub-hosted runners, workflow permissions defined for Pages | Pin third-party actions to commit SHAs for stronger supply-chain protection; use least privilege |
| External fonts | Third-party request/privacy, availability | Low / Low | CSS fallback fonts | Verify offline behavior and consider self-hosting if privacy priority changes |
| GitHub Pages | Misconfiguration / deployment failure | Low / Medium | Deploy workflow exists on branch | Confirm Pages source, HTTPS, deployment URL and rollback path |

## Current controls
- No user accounts, payment data, server API, database, resume uploads, or server-side resume storage.
- No server-side authorization, SQL injection, CSRF, SSRF, or upload surface exists in the current architecture.
- Resume analysis is local. The separate optional contact form is the only documented user-initiated data transmission.
- User-supplied content should never be inserted as raw HTML.
- Score and job-description overlap have explicit limitations.

## Release checks
1. Search HTML/JS/CSS and Git history for credentials and accidental personal data. A full history secret scan has not yet been performed.
2. Check all `innerHTML`, `insertAdjacentHTML`, `document.write`, and URL navigation sinks.
3. Paste `<script>alert(1)</script>` and HTML event-handler strings into every text field; no script should execute.
4. Confirm resume text is absent from network requests during analysis/download workflows.
5. Verify contact form failures are truthful and no sensitive content is logged.
6. Review dependency/action versions and GitHub Pages permissions.
7. Re-run automated tests and manually inspect the deployed site.

## Known limitations
This document is a threat model, not a professional penetration test or security certification. Git history scanning, full DOM sink audit, live network inspection, and hosting-header verification still require execution before declaring the release security-reviewed.
