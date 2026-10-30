# GitHub Pages deployment runbook

## Prerequisites
- The intended branch is `main`.
- Repository Settings → Pages uses GitHub Actions as the publishing source.
- The workflow `.github/workflows/pages.yml` is present on the branch being deployed.

## Deploy
1. Merge the reviewed PR only after explicit maintainer approval.
2. Open Actions → “Deploy HireSense to GitHub Pages”.
3. Confirm the build and deploy jobs complete successfully.
4. Open the page URL shown by the deployment job.
5. Check browser console for uncaught errors.
6. Test analysis and both Markdown/TXT downloads on desktop and a real phone.
7. Record the deployment URL and run ID in the release notes.

## Rollback
1. Identify the last known-good commit from the deployment history.
2. Revert the problematic commit on a new branch and open a PR.
3. Wait for CI to pass and review the diff.
4. After approval and merge to `main`, wait for Pages deployment to complete.
5. Re-test the deployed critical workflow.
6. If a Pages deployment itself is misconfigured, fix the Pages publishing source and rerun the workflow; do not claim rollback until the previous version is live again.

## Known limitations
A live deployment has not yet been confirmed from the current PR branch. A PR preview environment and manual production approval environment are not configured. This project has no database migrations or backend process to roll back.
