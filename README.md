# Sync Dashboard UI

This repository owns the Sync Dashboard React UI. The Admin Portal hosts its compiled bundle at `/sync-dashboard/sage-org-synctime-dashboard.js`; browser users visit `/syncschedules` in the Portal and do not need a separate dashboard site.

## Build and integration contract

Run `npm ci` and `npm run build:mfe` in the dashboard pipeline or in the Admin Portal build job. The output bundle exposes `window.SyncTimeDashboard.mount(element, { apiBaseUrl, environment, roles })` and `unmount()`. The Portal passes a DOM element, the same-origin `/api/v1/syncschedules` API base, and profile roles. The UI uses a memory router so it does not replace the Portal's route, and its CSS is scoped to `.synctime-dashboard-shell`.

The Portal backend owns authentication, authorization, AWS calls, and CloudWatch audit records. UI role checks only control which buttons appear. The bundle has no AWS credentials and does not contain connector resource names; the Portal API supplies approved connectors from its environment configuration. A missing API produces an error instead of a mock success.

The original Express and Lambda POC APIs remain in `backend-api` for reference. Their routes differ from the Portal API contract and must not be used as the production backend. The standalone `start` and `build` commands compile the UI, but the old Express API cannot satisfy the new Portal contract; use the Admin Portal pipeline and a deployed nonproduction environment for end-to-end verification.

See `SYNC_SCHEDULES_INTEGRATION.md` in the Admin Portal repository for the role migration, Parameter Store allowlist, IAM policy requirements, CloudWatch log group, and pipeline test steps.
