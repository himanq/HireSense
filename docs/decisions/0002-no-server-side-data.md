# ADR 0002: Do not store resume text server-side

- Status: Accepted for current prototype
- Date: 2026-10-30

## Context
Resume and job-description text can contain personal and employment information. The current workflow does not need cross-device sync or saved accounts.

## Decision
Process text in the browser and generate downloads locally. Do not upload, persist, log, or transmit resume/job-description text to a HireSense server. Keep the optional contact form separate and disclose its third-party boundary.

## Alternatives considered
- Store resume text in a database: rejected because there is no current account or saved-resume requirement.
- Send text to an LLM API: rejected until the product owner explicitly approves a privacy, provider, cost, and retention design.

## Consequences
- Lower data exposure and operating cost.
- No cross-device saved history or server-side collaboration.
- If persistence or AI processing is introduced, obtain explicit product approval and design consent, deletion/export, retention, access control, and data-protection safeguards first.
