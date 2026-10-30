# Hosting plan

## Launch target
GitHub Pages static hosting for a public portfolio/demo project. Estimated launch hosting cost: ₹0 on the current free static hosting path, subject to GitHub's current limits and terms. This is an estimate, not a billing guarantee. A custom domain is optional and would have a separate registrar cost.

## Components
| Component | Provider / plan | Launch estimate | At 10x traffic | Notes |
|---|---|---:|---:|---|
| Frontend static files | GitHub Pages | ₹0 | ₹0 while within current limits | Confirm repository Pages settings and deployment run |
| Backend/API | None | ₹0 | Not applicable | No server-side product workflow today |
| Database | None | ₹0 | Not applicable | Resume analysis is client-side |
| File storage | Browser download Blob; no server storage | ₹0 | Not applicable | No uploaded resume is stored |
| Background jobs | None | ₹0 | Not applicable | No asynchronous server work |
| Email/contact | Web3Forms only if configured | Depends on provider plan | Reassess quota/abuse controls | Current key is blank, so delivery is not confirmed |
| Fonts | Google Fonts, optional | ₹0 at current usage | Reassess privacy/performance | Use CSS fallbacks if unavailable |

## Environments and configuration
- Local: local static server.
- Preview: branch/PR browser tests; a Pages preview environment is not configured.
- Production: GitHub Pages deploy on `main`.
- There are no required runtime environment variables for core resume analysis.
- Do not place a secret in client-side files. If a future provider requires a secret, use a backend rather than shipping it to the browser.

## Production checklist
- Enable GitHub Pages with GitHub Actions as the publishing source.
- Confirm HTTPS is enabled for the published site.
- Confirm the deployment workflow succeeded and record the resulting URL.
- Check links, JavaScript loading, analysis, and file downloads on the live site.
- Review security headers at the hosting layer; GitHub Pages does not provide arbitrary per-site header configuration through a plain static repository workflow.
- Set repository/account billing notifications where available.
- Do not claim separate staging/production data stores or server health checks: neither exists in this architecture.

## 10x considerations
At roughly 10x the assumed traffic, check GitHub Pages limits and asset delivery metrics first. Consider a static host with preview environments if limits or workflows require it. Add a backend/database only if product requirements introduce accounts, server-side processing, or persistent data.
