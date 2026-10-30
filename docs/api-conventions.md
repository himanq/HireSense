# API conventions and current applicability

HireSense currently has no first-party backend API. Its core analysis is performed by pure client-side functions in `analyzer.js`. Therefore there are no API routes, authentication middleware, organization context, server error envelopes, pagination, database queries, webhooks, or background jobs to standardize.

If a backend is introduced, use these requirements before shipping:
- REST endpoints under `/api/v1` with nouns and standard HTTP methods.
- Validate all request bodies, query parameters, and path parameters at the boundary.
- Return a consistent JSON error shape with stable error codes and appropriate HTTP status.
- Authenticate and authorize every protected operation server-side.
- Scope every tenant-owned record to the authenticated organization.
- Paginate list endpoints and define idempotency for retryable mutations/webhooks.
- Add unit and integration tests against real test infrastructure.
- Never accept resume text or account identifiers as authorization proof.

Do not create a fake health endpoint or empty API just to satisfy a checklist.
