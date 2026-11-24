# Internal UI screen contracts

Stage 5 defines one consistent shell contract for every authenticated screen under `apps/web/src/app/(app)`. These contracts are descriptive of the rebuilt screens; they are not new copy for the public site.

## Global shell

- `AppShell` is the only owner of `<main id="main-content">`. Route files render `<div>`/fragments inside it.
- Every screen renders exactly one `PageHeader` with a level-1 heading. Secondary regions use `SectionHeader`.
- Breadcrumbs remain shell-owned. Page headers do not pass duplicate breadcrumbs.
- Top-level page actions use `ButtonLink`/`Button`; legacy `className="button"` remains only where an existing test selector depends on it.
- Loading states use `SkeletonTable`, `SkeletonLines`, or `Skeleton`; empty states use `EmptyState`; errors use `InlineBanner` with an optional retry action.

## Shared data primitives

- `DataTable` provides search, filters, sort with `aria-sort`, density, pagination, selection, bulk actions, and virtualization above 200 rows.
  - `className` is appended to `table.ui-table` so legacy selectors such as `table.leads-table` keep working.
  - `rowAttributes` preserves stable selectors such as `data-lead-id` and `data-contact-request-id`.
  - `initialSort` reflects server-applied sort without rewriting the existing query-string filter contract.
- `KanbanBoard` provides board/list views, keyboard move menu, drag-and-drop, optimistic update, rollback, and error toast.
  - Column `attributes` preserve `data-stage`.
  - Card `attributes` preserve `data-lead-id`, `data-stage`, and `lead-card`.
  - Card `actions` render outside the card button so nested forms remain valid HTML.

## Screen inventory

| Route | Role gate | Header | Main contract |
| --- | --- | --- | --- |
| `/dashboard` | authenticated | Dashboard | Workspace links to Leads and CMS. |
| `/leads` | `canEnqueueScan` | Leads | Server query/filter toolbar, Board/Table view switch, `KanbanBoard` or `DataTable`. Board exposes all six stages and per-lead scan actions. |
| `/leads/new` | `canEnqueueScan` | New lead | `LeadForm`; forbidden state is an `InlineBanner`. |
| `/leads/[id]` | authenticated | Lead company | `SectionHeader` overview/actions/scans/documents/activity; internal brief stays in a `<pre class="lead-detail-brief">`. |
| `/leads/[id]/edit` | `canEnqueueScan` | Edit lead | `LeadForm` with hidden lead id. |
| `/leads/review` | admin | Review queue | Real list of new or overdue leads; clear state when empty. |
| `/leads/sources` | admin | Sources | Scan status counts and recent scan list. |
| `/settings/dnc` | admin | DNC | Add form, normalized entry table, remove actions. |
| `/contact-requests` | `canEnqueueScan` | Contact requests | `DataTable` preserving request-id rows and promote action. |
| `/documents` | authenticated | Documents | `DataTable` with document search and PDF download links. |
| `/documents/new` | authenticated | New document | `DocumentForm` plus preserved status banners. |
| `/cms` | CMS viewer | CMS | Permission-aware section links and `DataTable` for posts. |
| `/cms/posts/new` | CMS editor | New post | `PostForm`. |
| `/cms/posts/[id]/edit` | post owner/admin | Edit post | `PostForm` with status description. |
| `/cms/authors` | CMS admin | Authors | Author table and creation form. |
| `/cms/media` | CMS editor/admin | Media | Media table and upload form. |
| `/cms/site` | CMS admin | Site settings | Locale/status tabs and `SiteForm`; draft case-study risk remains documented in the stage handoff. |

## Selector compatibility

- `section[data-stage]` stays on Kanban columns; `.lead-card[data-lead-id][data-stage]` stays on cards.
- `table.leads-table`, `table.contact-requests-table`, `table.document-list`, `table.cms-table`, and `.dnc-table` remain available.
- Form field names, server action exports, and notice strings are unchanged by screen polish.
- No existing test assertion may be weakened to accommodate a layout change.
