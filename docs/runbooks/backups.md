# Backup and restore policy

The current HireSense prototype does not store resume text, user accounts, uploaded files, or application data on a server. User-entered text exists in the browser runtime and generated reports are downloaded to the user's device. Therefore there is no application database or object store to back up or restore.

Source code and deployment configuration are versioned in GitHub. Recovery uses Git history and the deployment rollback procedure in `docs/runbooks/deploy.md`.

If server-side persistence is introduced, this document must be replaced with a provider-specific backup schedule, retention window, encryption/access controls, and a tested restore procedure before production launch. No database restore has been performed because no database exists.
