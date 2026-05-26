# n8n Workflow Workarounds

The LABBIS API user `serviceapi_exergio` now has access to all required endpoints.
This file tracks remaining hardcoded values and pending improvements.

## Previously Blocked Endpoints (now accessible)

| Endpoint | Status | Updated Workflow |
|----------|--------|-----------------|
| `GET /SystGroup` | **RESOLVED** | sync-system-groups.json — now uses direct fetch |
| `GET /Systemos` | **RESOLVED** | sync-systems.json — now uses direct fetch |
| `GET /SystemUser` | **RESOLVED** | sync-system-users.json — now uses direct fetch |
| `GET /DefectAct/{id}/Job` | **RESOLVED** | sync-defect-jobs.json — enabled with dedup |
| `GET /DefectAct/{id}/Material` | **RESOLVED** | sync-defect-materials.json — enabled with dedup |
| `GET /PickListValue` | **ACCESS GRANTED** | Pending: need to test response shape and wire up dynamic status mapping |

## Remaining: Hardcoded Status Mapping

In `sync-defect-acts.json`, the status UUID→string mapping is still hardcoded with **PLACEHOLDER labels**.
These are guesses based on frequency distribution — actual labels are unknown.

```
db901732-a91a-4d18-8530-7df2f8a155e7 → "Completed"    (55%) — PLACEHOLDER
43a503e3-9e9b-40b8-8c9c-3bef59371a15 → "In Progress"  (27%) — PLACEHOLDER
360bd67b-249d-42d0-b32e-5ec16c8c74bc → "New"           (10%) — PLACEHOLDER
386d2e1b-b6a8-45c5-b10a-1e495fe956d9 → "On Hold"       (3%) — PLACEHOLDER
c076d20b-b3d4-467a-b1d4-dfe24ff4b279 → "Cancelled"     (2%) — PLACEHOLDER
132ceb39-d54d-4f84-a091-34d940953586 → "Rejected"      (2%) — PLACEHOLDER
fa324ff1-7078-4d87-a014-d4697b6317c0 → "Reopened"      (1%) — PLACEHOLDER
```

**To fix:** Test `GET /PickListValue?rowsPerPage=10` to see response shape, match UUIDs to actual labels, then replace hardcoded STATUS_MAP with dynamic fetch.

## SystemUser Endpoint Does Not Exist

`GET /SystemUser` returns 404. Clerk and SystemUser are different entities in LABBIS.
Clerks are the actual actors referenced by DefectActs (`ClerkId`). The workflow uses `GET /Clerk?rowsPerPage=200`.
Email, phone, and job_title are not available from the Clerk model.

## Directus FK Validation

Directus validates foreign keys on insert via the API. The defect_acts workflow now checks that `system_id`, `system_group_id`, and `object_id` references exist in Directus before inserting — sets to `null` if not found.

## Remaining TODO

- **PickListValue integration:** Test endpoint, identify status picklist, build dynamic mapping in sync-defect-acts.json
- **UoMId (unit):** In jobs/materials, `UoMId` is a UUID. Need to resolve to a string unit name via PickListValue
- **Priority field:** Set to `null` in defect_acts. Source unknown — check if it comes from a PickList

## Dedup Strategy

All workflows now include dedup logic:
1. Fetch existing `labbis_id` values from the target Directus collection
2. Build a Set of known IDs
3. Skip items where `labbis_id` already exists in Directus
4. Only insert truly new records

This makes workflows safe to re-run without duplicates.
