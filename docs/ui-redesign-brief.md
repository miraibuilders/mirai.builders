# Internal UI redesign brief for external coding model

Read this file before writing code.

Purpose: give another model a complete inventory of the authenticated admin/CMS/CRM frontend so it can design and implement a premium internal UI. The user will review that model's code and then ask this repository's agent to adapt it. This file is the source-of-truth scope for that work.

Scope: authenticated internal app, login screen, shared internal UI primitives, shared route states, and the dev/QA component screens used by tests.

Out of scope: public marketing pages, legal pages, public blog rendering, scanner/scoring logic, database schema, migrations, auth guard behavior, server action behavior, PDF renderer/fonts, deployment config, and generated Japanese copy.

## 0. Recommended stack

Use **vanilla CSS with the existing global design-token system**.

- Keep the current Next.js App Router structure.
- Keep the existing global CSS model: `globals.css`, `ui.css`, `shell.css`, plus route-specific CSS files.
- Use CSS custom properties for color, spacing, radius, shadow, motion, typography, and z-index.
- Extend/refactor `apps/web/src/ui/ui.css` and `apps/web/src/ui/shell.css` instead of introducing a new styling framework.
- Do **not** add Tailwind. It conflicts with the existing class contracts, would add build config/dependencies, and is not needed.
- Do **not** add CSS-in-JS, Material UI, Chakra, shadcn, Radix UI, Lucide, or any heavy component library.
- Do **not** add new runtime font fetching. Noto Sans JP is already loaded at build time in `apps/web/src/app/layout.tsx`.
- Do **not** add new dependencies unless the user explicitly approves them.
- Prefer changing existing test-facing global classes over introducing new unrelated class systems.
- If adding private subcomponent classes is necessary, keep all existing `ui-*`, legacy route classes, data attributes, and ARIA labels as aliases.

## 1. Non-negotiable rules

The external model must follow these rules:

- Output only new or changed files. Do not regenerate the entire repository.
- Do not edit tests to accommodate layout changes.
- Do not change field `name` attributes, server action exports, action signatures, redirect notices, or URL query parameter names.
- Do not remove or rename selectors used by tests.
- Do not weaken accessibility roles, labels, focus behavior, keyboard behavior, or reduced-motion behavior.
- Do not add comments to code unless explicitly asked.
- Do not generate Japanese copy. If new Japanese copy seems necessary, leave an English placeholder and ask.
- Do not commit or push.
- Preserve exactly one `<main id="main-content">` in the authenticated app shell.
- Preserve one `PageHeader` with one level-1 heading per screen.
- Breadcrumbs stay in the shell; page-level components must not duplicate them.
- Keep `ToastProvider` in `apps/web/src/app/layout.tsx`.
- Keep `.ui-toast-viewport` excluded from dialog inerting.
- Keep all sticky table headers, rounded viewport styles, dialog/toast shadows, backdrop blur, and transform transitions needed by tests.

## 2. Global/root files

These files affect every internal screen.

| File | Purpose |
| --- | --- |
| `apps/web/src/app/layout.tsx` | Root layout, Noto Sans JP font, global CSS imports, `ToastProvider`. |
| `apps/web/src/app/globals.css` | Legacy global tokens/base styles. Also affects public site. |
| `apps/web/src/ui/ui.css` | Main internal UI token and primitive styles. |
| `apps/web/src/ui/shell.css` | App shell, topbar, sidebar, page headers, responsive shell styles. |
| `apps/web/src/ui/tokens.ts` | TS mirror of design tokens. |
| `apps/web/src/ui/tokens.test.ts` | Pins exact token values. Change only if intentionally updating the token system, and update this test deliberately. |
| `apps/web/src/lib/navigation.ts` | Nav items, role visibility, active-state matching, breadcrumbs. |
| `apps/web/src/lib/crm-auth.ts` | CRM role helpers: `admin`, `editor`, `viewer`, `user`. |
| `apps/web/src/lib/app-user.ts` | App user/session lookup used by the shell. |
| `apps/web/src/middleware.ts` | Injects pathname headers used for login redirects. |

Warning: `globals.css` affects public marketing pages. Prefer scoped internal styling changes in `ui.css`, `shell.css`, and route CSS. If global changes affect public pages, verify the public site afterward.

## 3. Authenticated app shell

Files:

- `apps/web/src/app/(app)/layout.tsx`
- `apps/web/src/app/(app)/_shell/app-shell.tsx`
- `apps/web/src/app/(app)/_shell/sidebar-nav.tsx`
- `apps/web/src/app/(app)/_shell/top-bar.tsx`
- `apps/web/src/app/(app)/_shell/command-palette.tsx`
- `apps/web/src/app/(app)/_shell/mobile-bottom-bar.tsx`
- `apps/web/src/app/(app)/_shell/account-menu.tsx`

Elements to design:

- Skip link `Skip to main content`.
- `.ui-app-shell` desktop grid.
- Sidebar `<aside aria-label="Sidebar">`.
- Brand block: `MIRAI Lab`, `Internal`.
- `<nav aria-label="Main navigation">`.
- Sidebar groups: `Work`, `Documents`, `Content`, `Admin`.
- Sidebar links:
  - `Dashboard` → `/dashboard`
  - `Leads` → `/leads`
  - `Contact requests` → `/contact-requests`
  - `Documents` → `/documents`
  - `CMS` → `/cms`
  - `Site settings` → `/cms/site`
  - `Review queue` → `/leads/review`
  - `Sources` → `/leads/sources`
  - `DNC` → `/settings/dnc`
- Topbar:
  - Mobile menu button `Open navigation`
  - Breadcrumb nav `aria-label="Breadcrumb"`
  - Command palette trigger `aria-label="Open command palette"`
  - Shortcut `⌘K` / platform-aware equivalent
  - Account button `aria-label="Account: {name}, {role}"`
- Account popover:
  - Avatar
  - User name
  - Role badge
  - Email
  - `Sign out`
- Command palette:
  - Dialog title `Command palette`
  - Description `Navigation and actions you can already access.`
  - Combobox `Search commands`
  - Command list
  - Empty state `No matching commands`
  - Footer `↑↓ to navigate · Enter to open · Escape to close`
  - Extra commands: `Create lead`, `Create document`, `Create post`, `Sign out`
- Mobile drawer:
  - Dialog title `Navigation`
  - Reused sidebar navigation
- Mobile bottom bar:
  - `<nav aria-label="Quick navigation">`
  - Hardcoded base items: Dashboard, Leads, Documents, CMS, role-filtered
- Main landmark:
  - Exactly one `<main id="main-content">`

Design goals:

- Make the shell feel like a premium operations console.
- Stronger brand header, clearer section grouping, better active states, better density, better hover/pressed states.
- Command palette should feel like a real command center with grouped commands, better selected states, and scroll-follow.
- Improve right-edge alignment of account popover.
- Fix navigation role inconsistencies carefully while preserving test-visible links:
  - Editor currently sees `Site settings` in nav but is blocked on the page.
  - Viewer can access `/cms` directly but has no sidebar CMS item.
  - `user` role can have empty sidebar because no nav item includes it.
- Align sidebar-hidden and mobile-bottom-bar breakpoints; currently sidebar hides at 900px but bottom bar appears at 760px.
- Do not open drawer and command palette simultaneously.
- Keep `.ui-sidebar` hidden at 390px.

Preserve:

- `.ui-sidebar`
- `.ui-sidebar-group`
- `.ui-sidebar a[href="/dashboard"]` with `aria-current="page"` on `/dashboard`
- Admin-visible group containing text `Admin`
- `/leads/review` and `/settings/dnc` links for admin
- Editor hiding of `Admin` group and `/leads/review`
- `Open command palette` button
- `Open navigation` button
- `Quick navigation`
- Dialog names `Command palette` and `Navigation`
- `No matching commands`
- `Control+k` and `Meta+K`
- `.ui-dialog-layer[data-variant="palette"]`
- `.ui-command-list li` with `transform` transition

## 4. Shared route states

Files:

- `apps/web/src/app/(app)/loading.tsx`
- `apps/web/src/app/(app)/error.tsx`
- `apps/web/src/app/(app)/not-found.tsx`

Elements:

### Loading

- `h1` `Loading workspace`
- `Preparing your internal view.`
- `aria-busy="true"`
- `aria-live="polite"`
- `.ui-route-state`
- `SkeletonLines`
- `Skeleton`
- `SkeletonTable` with `role="status"` and `aria-label="Loading"`

### Error

- `h1` `Something went wrong`
- `This view could not be loaded. Your session and saved data are unaffected.`
- Danger banner title `View error`
- `error.message || "An unexpected error occurred."`
- `Try again`

### Not found

- `h1` `Page not found`
- `The internal page you requested does not exist.`
- Empty state title `No matching internal page`
- Empty state description `Use the navigation or return to the dashboard.`
- `Go to dashboard`

Design goals:

- Upgrade visual polish while preserving roles and copy.
- Consider sanitizing raw `error.message` in the internal error boundary.

Preserve:

- `role="alert"` on error state.
- `aria-busy` and `aria-live` on loading state.
- `Go to dashboard` action.

## 5. Route inventory and per-page design brief

### 5.1 `/dashboard`

Files:

- `apps/web/src/app/(app)/dashboard/page.tsx`

Role gate:

- Authenticated app shell.

Current elements:

- `.container`
- `.ui-page-header h1` `Dashboard`
- Description `Internal entry point for CRM and content workflows.`
- Section `Workspaces`
- Description `Open a workspace to continue.`
- `.cms-nav[aria-label="Workspaces"]`
- `ButtonLink` `Leads`
- `ButtonLink` `CMS`

Design goals:

- Replace placeholder dashboard with a premium overview.
- Add KPI cards, focus queue, recent activity, quick actions, and role-aware shortcuts.
- Use only existing data sources or data already available to the page; do not change backend.
- Fix or intentionally label the `CMS` workspace for viewers.

Preserve:

- `Dashboard` body text.
- `.ui-page-header h1`.
- Unauthenticated redirect to `/login?next=`.

### 5.2 `/leads`

Files:

- `apps/web/src/app/(app)/leads/page.tsx`
- `apps/web/src/app/(app)/leads/_components/leads-board.tsx`
- `apps/web/src/app/(app)/leads/leads.css`
- Shared: `apps/web/src/ui/data-table.tsx`, `apps/web/src/ui/kanban.tsx`

Role gate:

- `canEnqueueScan`: admin/editor.

Current elements:

- Header with `New lead` and `Contact requests` actions.
- GET filter form:
  - `segment`
  - `pain`
  - `overdue`
  - `Apply`
- Board/Table view switch.
- Metrics not currently present.
- `DataTable` columns:
  - Company
  - Segment
  - Score
  - Tier
  - Stage
  - Pain
  - Next date
  - Contact
- `KanbanBoard` with six stages:
  - `new`
  - `contacted`
  - `checking`
  - `quoted`
  - `won`
  - `lost`
- Cards show:
  - Company
  - `Score:`
  - `Tier:`
  - `Open`
  - `Trigger scan`
- Scan polling timeout `.leads-timeout`.

Design goals:

- Add a premium CRM command-strip with total leads, tier A, new stage, overdue, pending scans.
- Redesign filter bar with active-filter count and clear filters.
- Add score heat bars, tier chips, pain chips, overdue date styling, scan-state dots.
- Improve Kanban cards and column headers without changing drag/drop behavior.
- Add loading/error states through existing DataTable/Kanban props.
- Improve mobile table and board presentation.

Preserve:

- `table.ui-table.leads-table`
- `getByLabel("Search leads")`
- `getByRole("group", { name: "Table density" })`
- Button `Compact`
- `.ui-table-component[data-density="compact"]`
- `table.leads-table tbody tr[data-lead-id]`
- Column order: Company, Segment, Score, Tier, Stage, Pain, Next date, Contact
- `.ui-kanban.leads-kanban`
- `section[data-stage]` count exactly 6 and order `new,contacted,checking,quoted,won,lost`
- `.lead-card[data-lead-id]`
- `data-stage`
- Literal `Score:` and `Tier:`
- `Trigger scan`
- Scan notice URLs with `notice=scan%20queued` and `notice=detail%20queued`
- `.leads-timeout`
- Drag/drop and synthetic drag fallback behavior
- No duplicate `[data-lead-id]` elements

### 5.3 `/leads/new`

Files:

- `apps/web/src/app/(app)/leads/new/page.tsx`
- `apps/web/src/app/(app)/leads/_components/lead-form.tsx`

Role gate:

- `canEnqueueScan`: admin/editor.

Current elements:

- Header `New lead`
- `Back to leads`
- `LeadForm`
- Fields:
  - `company`
  - `websiteUrl`
  - `segment`
  - `reachability`
  - `sizeProxy`
  - `nextStep`
  - `note`
- Submit `Create lead`

Design goals:

- Group fields into Company, Qualification, Follow-up.
- Add help text and inline validation.
- Keep validation rules unchanged.
- Responsive two-column/one-column layout.

Preserve:

- `input[name="company"]` with `ui-input`
- `select[name="segment"]` with `ui-select`
- `textarea[name="note"]` with `ui-textarea`
- `button[type="submit"]`
- Visible `Create lead`
- All current field names and option values

### 5.4 `/leads/[id]`

Files:

- `apps/web/src/app/(app)/leads/[id]/page.tsx`
- `apps/web/src/app/(app)/leads/[id]/activity-form.tsx`

Role gate:

- Authenticated; read-only banner for forbidden roles.

Current elements:

- Header with lead company.
- Scan notice `.lead-notice`.
- Read-only banner.
- Overview `<dl>`.
- Contact block.
- Actions:
  - Edit
  - Trigger scan
  - Analyse in detail
  - Delete lead
- Activity form:
  - `textarea[name="note"]`
  - `input[name="nextStep"]`
  - `input[name="nextDate"]`
  - `Add activity`
- Scan summary.
- Internal detail brief `<pre class="lead-detail-brief">`.
- Documents list.
- Activity table:
  - `table.lead-activity-list.ui-table`
  - `caption.ui-sr-only` with `Lead activity history`
- `Delete lead`
- Duplicate back link.

Design goals:

- Turn into a premium lead review workspace.
- Score/tier/stage hero card.
- Next-step callout.
- Scan status and brief panel.
- Timeline-style activity.
- Responsive single-column layout.
- Keep internal brief visible.

Preserve:

- Lead field text assertions: company, `professional_office`, `referral`, `5`, `Send quote`.
- `.lead-notice`
- `scan ran recently; wait`
- `.lead-detail-brief`
- `# Internal detail brief`
- `textarea[name="note"]`
- `input[name="nextStep"]`
- Activity form submission behavior
- One-click `Delete lead`; do not add confirmation modal
- `table.lead-activity-list.ui-table`
- Caption `Lead activity history`

### 5.5 `/leads/[id]/edit`

Files:

- `apps/web/src/app/(app)/leads/[id]/edit/page.tsx`
- `apps/web/src/app/(app)/leads/_components/lead-form.tsx`

Role gate:

- `canEnqueueScan`: admin/editor.

Current elements:

- Header `Edit lead`
- `Back to lead`
- `LeadForm` prefilled with hidden lead id.
- Submit `Save lead`.

Design goals:

- Same form treatment as `/leads/new`.
- Show clear edit context, status, and last scan summary if available.

Preserve:

- Hidden id field.
- All field names.
- `Save lead`.

### 5.6 `/leads/review`

Files:

- `apps/web/src/app/(app)/leads/review/page.tsx`

Role gate:

- Admin.

Current elements:

- Header `Review queue`
- Section `Needs review`
- Empty state `Queue clear`
- Empty description `No new or overdue leads need review right now.`
- Plain table with company, stage, score, next date.

Design goals:

- Add summary cards, severity/age chips, better table density and row affordance.
- Keep empty state behavior.

Preserve:

- `Review queue` h1.
- `Needs review`.
- Empty strings.
- `.ui-table-viewport` and `table.ui-table` contracts.

### 5.7 `/leads/sources`

Files:

- `apps/web/src/app/(app)/leads/sources/page.tsx`

Role gate:

- Admin.

Current elements:

- Header `Sources`
- Section `Pipeline status`
- Section `Recent scans`
- Status counts table.
- Recent scans table with UUID lead link, kind, status, timestamp.
- Empty state `No scans yet`.
- Empty description `Trigger a lead scan to populate source health.`

Design goals:

- Convert counts into health cards while retaining the two table regions.
- Add status/kind chips and cleaner date formatting.
- Avoid removing raw accessible values.

Preserve:

- `Sources`, `Pipeline status`, `Recent scans`.
- `.ui-table-viewport` and `table.ui-table`.
- Empty strings.
- Sticky header and rounded viewport.

### 5.8 `/contact-requests`

Files:

- `apps/web/src/app/(app)/contact-requests/page.tsx`
- `apps/web/src/app/(app)/contact-requests/_components/contact-requests-table.tsx`
- `apps/web/src/app/(app)/contact-requests/contact-requests.css`

Role gate:

- Page shows content for `canEnqueueScan`; viewer/user see forbidden banner.

Current elements:

- Header `Contact requests`
- Description `Inquiries waiting to be promoted into the CRM.`
- Danger banner `Forbidden`
- `Back to leads`
- DataTable with columns:
  - Received
  - Name
  - Company
  - Email
  - Phone
  - Message
  - Lead
  - Action
- `Promote to lead`
- `Promoted`
- Empty state `No contact requests`

Design goals:

- Premium inbox/table treatment.
- Message preview with expansion.
- Promoted chip.
- Better empty state.
- Keep sticky header and rounded viewport.

Preserve:

- `Search contact requests`
- `.ui-table-component`
- `[data-contact-request-id]`
- `Promote to lead`
- Promotion redirect `/leads/{id}`
- `Promoted`
- Eight columns and default sort by Received desc

### 5.9 `/documents`

Files:

- `apps/web/src/app/(app)/documents/page.tsx`
- `apps/web/src/app/(app)/documents/_components/document-list-table.tsx`
- `apps/web/src/app/(app)/documents/documents.css`

Role gate:

- Authenticated.

Current elements:

- Header `Documents`
- Description `Generated PDFs and their delivery status.`
- `New document`
- DataTable columns:
  - Type
  - Recipient
  - Issue date
  - Variant
  - PDF
- `Download PDF`
- Empty state `No documents yet`

Design goals:

- Type icons, variant chips, clean dates, stronger download affordance.
- Better empty state.

Preserve:

- `Search documents`
- `.ui-table-component`
- `table.document-list`
- `Download PDF`
- Sticky header and rounded viewport

### 5.10 `/documents/new`

Files:

- `apps/web/src/app/(app)/documents/new/page.tsx`
- `apps/web/src/app/(app)/documents/new/document-form.tsx`
- `apps/web/src/app/(app)/documents/new/actions.ts`
- `apps/web/src/app/(app)/documents/documents.css`

Role gate:

- Authenticated.

Current elements:

- Header `New document`
- `Back to documents`
- Form fields:
  - `type`
  - `leadId`
  - `templateVariant`
  - `partnerName`
  - `issueDate`
  - `dueDate`
  - `issuerName`
  - `invoiceNumber`
  - `transactionDate`
  - `registrationNumber`
- Line items:
  - `item_description[]`
  - `item_quantity[]`
  - `item_unit_price[]`
  - `item_tax_rate[]`
  - `Add line`
  - `Remove`
- Submit `Create document`
- Success:
  - `.document-status.success`
  - `role="status"`
  - `Document created`
  - `Download PDF`
- Error:
  - `.document-status.error`
  - `role="alert"`
  - `Document not created`
  - Exact bracketed error tokens

Design goals:

- Group into Document setup, Recipient/dates, Issuer details, Line items.
- Premium line-item editor with totals preview if client-side only.
- Pending state.

Preserve:

- All field names, option values, `maxLength`, required attributes.
- `aria-label="Line N description"`, `quantity`, `unit price`, `tax rate`, `Remove line N`.
- `.document-status.success`, `.document-status.error`.
- Exact error tokens.
- `Download PDF` link.

### 5.11 `/cms`

Files:

- `apps/web/src/app/(app)/cms/layout.tsx`
- `apps/web/src/app/(app)/cms/page.tsx`
- `apps/web/src/app/(app)/cms/_components/cms-posts-table.tsx`
- `apps/web/src/app/(app)/cms/cms.css`

Role gate:

- CMS viewer/admin/editor; layout blocks `user`.

Current elements:

- Header `CMS`
- Description `Posts, authors, media, and site settings.`
- `.cms-nav[aria-label="CMS sections"]`
- Role-aware links:
  - `New post`
  - `Authors`
  - `Site settings`
  - `Media`
- Notice banner.
- Section `Posts`
- DataTable columns:
  - Title
  - Slug
  - Status
  - Author
  - Actions
- Row actions:
  - `Edit`
  - `Publish`
  - `Delete`
- `Search posts`
- Status filter `Draft` / `Published`
- Empty state `No posts yet`

Design goals:

- Content-operations dashboard with draft/published/media/author cards.
- Premium post table and action nav.
- Status chips and author avatars.

Preserve:

- `table.cms-table.ui-table`
- `.ui-table-component`
- `data-post-id`
- `Search posts`
- Status options
- `Edit`, `Publish`, `Delete`
- `Publish` only for admin + draft
- `Delete` only for admin
- Sticky header and rounded viewport
- Empty strings

### 5.12 `/cms/posts/new`

Files:

- `apps/web/src/app/(app)/cms/posts/new/page.tsx`
- `apps/web/src/app/(app)/cms/_components/post-form.tsx`

Role gate:

- CMS editor/admin.

Current elements:

- Header `New post`
- Description `Create a draft, then publish it when it is ready.`
- `Back to CMS`
- Notice banner.
- Fields:
  - `title`
  - `slug`
  - `bodyMd`
  - `seoTitle`
  - `seoDescription`
  - `faqJsonLd`
- Submit `Save post`

Design goals:

- Split into Content, SEO, Structured data.
- Add markdown help, slug preview, SEO preview.
- Preserve all field names.

Preserve:

- `input[name="title"]` with `ui-input`
- `textarea[name="bodyMd"]` with `ui-textarea`
- `Save post` with `ui-button`
- Required attributes
- `Draft created` notice path

### 5.13 `/cms/posts/[id]/edit`

Files:

- `apps/web/src/app/(app)/cms/posts/[id]/edit/page.tsx`
- `apps/web/src/app/(app)/cms/_components/post-form.tsx`

Role gate:

- Admin or owning editor.

Current elements:

- Header `Edit post: {title}`
- Description `Status: {status}`
- `Back to CMS`
- Same `PostForm`
- Hidden `postId`

Design goals:

- Same as new post plus clear edit/status context.

Preserve:

- Hidden `postId`.
- `Save post`.
- `Draft updated` notice path.
- Editor ownership behavior.

### 5.14 `/cms/site`

Files:

- `apps/web/src/app/(app)/cms/site/page.tsx`
- `apps/web/src/app/(app)/cms/site/site-form.tsx`
- `apps/web/src/app/(app)/cms/site/form-state.ts`
- `apps/web/src/app/(app)/cms/site/actions.ts`

Role gate:

- Admin only; editor redirects to `/?notice=CMS_FORBIDDEN`.

Current elements:

- Header `Site settings`
- Description `Homepage copy, pricing tiers, and published case studies.`
- `CMS` back link
- Notice banner
- Locale tabs:
  - `日本語`
  - `English`
- Japanese panel:
  - Contact
  - Hero
  - Offer
  - About author
  - Footer
  - Phone, email, address, headline, subheadline, CTA, hero image, image alt, offer name/description/price, author name/bio/image, copyright
- English panel:
  - Contact, Hero, Offer, About author, Footer fields
- Pricing tiers editor:
  - `tier-row-${index}`
  - repeated `tierNameJa`
  - indexed names
  - up/down/remove
  - `Add pricing tier`
- Case studies editor:
  - `case-row-${index}`
  - repeated `caseStatus`
  - indexed names
  - image uploads
  - up/down/remove
  - `Add case study`
- Error banner `data-testid="form-error"`
- Error summary `data-testid="error-summary"`
- Field errors `data-testid="error-${name}"`
- Submit `Save site settings`

Design goals:

- Premium settings console with sticky section index or left nav.
- Image preview cards.
- Better reorder affordances while keeping up/down controls.
- Validation summary at top.
- Unsaved changes indicator if feasible.

Preserve:

- Tabs `日本語`, `English`.
- IDs `ui-tab-ja`, `ui-tab-en`, `ui-tabpanel-ja`, `ui-tabpanel-en`.
- Accessible labels:
  - `Phone`
  - `Hero headline (ja)`
  - `Offer name (ja)`
  - `Offer price`
  - `Hero image alt (ja)`
  - `Case study 0 status`
  - `Case study 0 title ja`
- `Save site settings`.
- Error codes and test IDs.
- All hidden image metadata fields.
- All repeated/indexed input names.

### 5.15 `/cms/authors`

Files:

- `apps/web/src/app/(app)/cms/authors/page.tsx`

Role gate:

- Admin.

Current elements:

- Header `Authors`
- Description `Content bylines linked to internal users.`
- Table headers Name, Bio, Photo URL, User
- Empty `No authors yet.`
- New author form:
  - `name`
  - `bio`
  - `photoUrl`
  - `userId`
  - `Save author`

Design goals:

- Author avatar preview.
- Linked user chip.
- Bio truncation.
- Compact form panel.

Preserve:

- `table.cms-table.ui-table`
- Sticky header and rounded viewport.
- Field names and labels.
- Empty string.

### 5.16 `/cms/media`

Files:

- `apps/web/src/app/(app)/cms/media/page.tsx`

Role gate:

- Media list visible to CMS viewer/admin/editor; upload visible to admin/editor.

Current elements:

- Header `Media`
- Description `Uploaded assets used by CMS posts and site settings.`
- Table headers Filename, MIME type, Size, URL
- Empty `No media uploaded yet.`
- Upload form:
  - `input[type="file"][name="file"]`
  - `File`
  - `Upload`

Design goals:

- Thumbnail previews.
- Dropzone styling while keeping real file input.
- Surface allowed MIME and size constraints.
- Copyable URL affordance.

Preserve:

- `table.cms-table.ui-table`
- Sticky header and rounded viewport.
- Multipart form.
- Required file input.
- Field/button labels.
- Empty string.

### 5.17 `/settings/dnc`

Files:

- `apps/web/src/app/(app)/settings/dnc/page.tsx`
- `apps/web/src/app/(app)/settings/dnc/actions.ts`
- `apps/web/src/lib/dnc.ts`

Role gate:

- Admin.

Current elements:

- Header `DNC`
- Description `Admin-only do-not-contact list management.`
- Section `Add entry`
- Description `Domains, email addresses, and phone numbers are normalized.`
- Form:
  - `kind`
  - `value`
  - `reason`
  - `Add DNC entry`
- Section `Entries`
- Description `{n} blocked destination(s).`
- Table caption `Do-not-contact entries`
- Headers Type, Normalized value, Reason, Added, Actions
- Remove buttons
- Empty `No DNC entries yet.`

Design goals:

- Kind chips/icons.
- Better reason truncation.
- Danger styling for invalid notices.
- Premium table and form treatment.

Preserve:

- `select[name="kind"]`
- `getByLabel("DNC value")`
- `getByLabel("DNC reason")`
- `Add DNC entry`
- `Remove`
- `.dnc-table tbody tr`
- Kind order: `corporate_number`, `domain`, `phone`, `name_key`
- Notice strings

### 5.18 `/login`

Files:

- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/login/login-form.tsx`

Role gate:

- None; outside app shell.

Current elements:

- `main.container`
- `h1` `ログイン`
- Email field `メールアドレス`
- Password field `パスワード`
- Submit `ログイン`
- Failure message `メールアドレスまたはパスワードが正しくありません。`

Design goals:

- Premium split-screen auth page.
- Brand panel + form panel.
- `autocomplete` attributes.
- Pending spinner.
- Accessible failure message.

Preserve:

- `input[name="email"]`
- `input[name="password"]`
- `button[type="submit"]`
- Exact Japanese strings.
- `?next=` redirect handling.
- Already-logged-in users still see the form.

## 6. Shared UI components inventory

All exports are available through `apps/web/src/ui/index.ts`. Do not break the barrel exports.

### Button system

Files:

- `apps/web/src/ui/button.tsx`
- `apps/web/src/ui/submit-button.tsx`

Exports:

- `Button`, `ButtonLink`, `buttonClass`, `SubmitButton`

Variants/states:

- `primary`, `secondary`, `ghost`, `destructive`
- `sm`, `md`
- `loading`, `disabled`, `iconOnly`
- demo states: default, hover, focus, loading

Preserve:

- `ui-button`, `ui-button--*`, `ui-spinner`
- `data-loading`, `aria-busy`
- `transform` in computed transition
- Button class assertions on `Create lead`, `Save post`, `Add DNC entry`

### Field system

File:

- `apps/web/src/ui/field.tsx`

Exports:

- `Input`, `Textarea`, `Select`, `FormField`, `ErrorSummary`

States:

- default, hover, focus, disabled, invalid, loading
- required/optional indicators
- help text
- field error
- error summary with links

Preserve:

- `ui-input`, `ui-textarea`, `ui-select`
- `ui-field`, `ui-field-label`, `ui-field-required`, `ui-field-optional`, `ui-field-help`, `ui-field-error`
- `data-testid="error-summary"`
- `3px solid` focus outline
- `aria-invalid`, `aria-describedby`

### Badge / Avatar

Files:

- `apps/web/src/ui/badge.tsx`
- `apps/web/src/ui/avatar.tsx`

Preserve:

- `ui-badge`
- `data-tone`
- tones: neutral, brand, success, warning, danger, info
- `ui-avatar`
- sizes sm/md/lg
- `role="img"` and `aria-label`

### Tooltip

File:

- `apps/web/src/ui/tooltip.tsx`

Preserve:

- `ui-tooltip-wrap`, `ui-tooltip-bubble`
- `role="tooltip"`
- generated `aria-describedby`
- demo text `Shows on hover and keyboard focus.`, `Forced hover.`

### Skeleton

File:

- `apps/web/src/ui/skeleton.tsx`

Exports:

- `Skeleton`, `SkeletonLines`, `SkeletonTable`

Preserve:

- `ui-skeleton`
- `role="status"`
- `aria-label="Loading"`
- screen-reader `Loading`

### Empty state

File:

- `apps/web/src/ui/empty-state.tsx`

Preserve:

- `ui-empty-state`, `.ui-empty-state-icon`, `.ui-empty-state-actions`
- title/description/action structure
- demo string `Nothing here yet`

### Banner

File:

- `apps/web/src/ui/banner.tsx`

Preserve:

- tones info/success/warning/danger
- danger role `alert`, others `status`
- `Dismiss message`
- demo strings including `Demo server error`

### Toast

File:

- `apps/web/src/ui/toast.tsx`

Preserve:

- `ToastProvider`, `useToast`
- tones success/error/info
- `data-testid="toast-success"`, `toast-error`
- exact strings `Saved`, `Failed`, `Bulk action complete`, `Move failed`
- `.ui-toast` shadow
- dismiss button `Dismiss notification`

### Dialog system

File:

- `apps/web/src/ui/dialog.tsx`

Exports:

- `Dialog`, `Modal`, `Drawer`, `ConfirmationDialog`, `Popover`, `useDialogBehavior`

Preserve:

- focus trap
- Escape stack
- background inert, excluding `.ui-toast-viewport`
- focus restoration
- `role="dialog"`
- `aria-modal`
- `aria-labelledby`, optional `aria-describedby`
- `.ui-dialog-layer`, `.ui-dialog-backdrop`, `.ui-dialog-panel`
- backdrop `blur`
- panel radius/shadow
- dialog names used by tests:
  - `Command palette`
  - `Navigation`
  - `Modal title`
  - `Drawer title`
  - `Delete this item?`
  - `Move {company} to stage`
- footer buttons `Cancel`, `Delete`, `Close`

### DataTable

File:

- `apps/web/src/ui/data-table.tsx`

Exports:

- `DataTable`, `DataTableColumn`, `DataTableFilter`, `DataTableBulkAction`, `DataTableProps`

Features:

- search debounce
- filters
- tri-state sort
- density
- pagination
- selection
- bulk actions
- virtualization above 200 rows
- loading/error/empty states
- optional URL sync

Preserve:

- `ui-table-component`, `ui-table-toolbar`, `ui-table-viewport`, `ui-table`
- sticky `thead th`
- rounded `.ui-table-viewport`
- `aria-sort`
- `aria-pressed`
- `data-density`
- `ui-table-select`
- `ui-sr-only` caption
- pagination strings:
  - `Rows per page`
  - `Page {n} of {m}`
  - `Previous`
  - `Next`
  - `{start}–{end} of {total}`
- URL keys: `q`, `sort`, `dir`, `page`, `density`
- storage key `mirai-ui-table-density`
- dev strings:
  - `1–25 of 100`
  - `26–50 of 100`
  - `25 selected`
  - `Last bulk action: reviewed 25`
  - `Demo server error`
  - `No companies`

### KanbanBoard

File:

- `apps/web/src/ui/kanban.tsx`

Exports:

- `KanbanBoard`, `KanbanCardBadge`, `KanbanHint`

Features:

- Board/List toggle
- stage filter
- drag/drop
- keyboard Enter/Space move popover
- optimistic move
- rollback
- error toast
- loading/error states

Preserve:

- `ui-kanban`, `ui-kanban-toolbar`, `ui-kanban-board`, `ui-kanban-column`, `ui-kanban-cards`, `ui-kanban-card`
- `section[data-stage]`
- `data-lead-id`
- `data-stage`
- `data-moving`
- `data-drop-target`
- card actions outside card button
- hint `Drag a card, or focus it and press Enter to move stages.`
- dev move log format `Move log: {cardId}: {from} → {to}`
- rollback behavior and `Move failed` toast

### Tabs

File:

- `apps/web/src/ui/tabs.tsx`

Preserve:

- `role="tablist"`
- `role="tab"`
- `aria-selected`
- `aria-controls`
- IDs `ui-tab-*`, `ui-tabpanel-*`
- ArrowLeft/ArrowRight keyboard switching

### Breadcrumbs

File:

- `apps/web/src/ui/breadcrumbs.tsx`

Preserve:

- `aria-label="Breadcrumb"`
- last item `aria-current="page"`

### PageHeader / SectionHeader

File:

- `apps/web/src/ui/page-header.tsx`

Preserve:

- `.ui-page-header h1`
- one h1 per screen
- `.ui-section-header`

### Icons

File:

- `apps/web/src/ui/icons.tsx`

Current icon names:

- `search`, `close`, `check`, `check-circle`, `alert-circle`, `alert-triangle`, `info`, `chevron-down`, `chevron-left`, `chevron-right`, `plus`, `trash`, `inbox`, `arrow-up`, `arrow-down`, `download`, `edit`, `phone`, `clock`, `file`, `user`, `menu`, `external-link`, `more`, `star`, `refresh`, `shield`, `calendar`, `eye`, `link`

Preserve all names used by current code. Adding names is okay.

### Tokens

Files:

- `apps/web/src/ui/tokens.ts`
- `apps/web/src/ui/tokens.test.ts`

Current token groups:

- spacing: 0, 4, 8, 12, 16, 24, 32, 48, 64px
- font sizes: 12, 14, 16, 18, 20, 24, 32px
- weights: 400, 500, 600
- line heights: body 1.5, heading 1.25
- radius: control 4, card 8, modal 12
- motion: 150ms, 250ms, ease-out
- z-index: 0, 10, 20, 30, 40, 50, 60
- icon sizes: 16, 20

If token values change, update `tokens.ts`, `ui.css`, and `tokens.test.ts` together.

## 7. Dev/QA screens

These are internal test surfaces and should be visually consistent with the redesign.

### `/dev/components`

File:

- `apps/web/src/app/dev/components/page.tsx`

Preserve:

- `main[data-hydrated="true"]`
- `data-demo-section` values:
  - `tokens`
  - `button`
  - `inputs`
  - `form-field`
  - `badge-avatar`
  - `tooltip`
  - `skeleton`
  - `banner`
  - `toast`
  - `dialog`
- Buttons:
  - `Open modal`
  - `Open drawer`
  - `Open confirmation`
  - `Open popover`
  - `Show success toast`
  - `Show error toast`
  - `Show info toast`
  - `Show undo toast`
- Input labels:
  - `Input default`
  - `Input hover`
  - `Input focus`
  - `Input disabled`
  - `Input error`
  - `Input loading`
- Demo text:
  - `Enter a valid value.`
  - `Company name is required.`
  - `Website must be a full URL.`
  - `Nothing here yet`
  - `Create first item`
  - `Learn more`
  - `Modal title`
  - `Drawer title`
  - `Delete this item?`
  - `Confirmation result: not confirmed`

### `/dev/data-table`

File:

- `apps/web/src/app/dev/data-table/page.tsx`

Preserve:

- 100/250 generated rows
- Columns Company, Segment, Score, Tier, Stage, Next step
- Toggles:
  - `Show loading`
  - `Stop loading`
  - `Show error`
  - `Clear error`
  - `Show empty`
  - `Restore rows`
  - `Use 100 rows`
  - `Use 250 rows`
- Bulk actions:
  - `Mark reviewed`
  - `Add to DNC`
- Strings:
  - `1–25 of 100`
  - `26–50 of 100`
  - `25 selected`
  - `Last bulk action: reviewed 25`
  - `Last bulk action: dnc 25`
  - `Demo server error`
  - `No companies`

### `/dev/kanban`

File:

- `apps/web/src/app/dev/kanban/page.tsx`

Preserve:

- six stages
- 10 cards
- storage key `mirai-stage2-kanban`
- rollback card `card-rollback` / `Rollback company`
- simulated failure `Simulated server failure`
- move log format `Move log: {cardId}: {from} → {to}`
- keyboard move popovers

## 8. Test files that define compatibility

The external model must read these before coding:

- `apps/web/tests/stage1-primitives.spec.ts`
- `apps/web/tests/stage2-primitives.spec.ts`
- `apps/web/tests/stage3-shell.spec.ts`
- `apps/web/tests/stage4-forms.spec.ts`
- `apps/web/tests/stage5-screens.spec.ts`
- `apps/web/tests/stage6-polish.spec.ts`
- `apps/web/tests/full-system.spec.ts`
- `apps/web/tests/fixtures/helpers.ts`
- `apps/web/src/ui/tokens.test.ts`

Additional contract file:

- `docs/ui-screens.md`

Do not edit these tests.

## 9. Expected output format from external model

Ask the external model to return:

- A short list of changed files.
- Full replacement content for each changed file, or precise patch instructions.
- A note for any file it thinks should change but is outside this brief.
- A note for any test selector or behavior it cannot preserve.
- No commit/push.
- No new dependencies.
- No generated Japanese copy.
- No comments in code.

## 10. Verification after adapting generated code

Run all of these:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build` with dev server stopped
- `pnpm test`
- `pnpm --filter @mirai/web test:e2e:full` with local DB and worker running
- `pnpm seed:demo` last
- Screenshot review at:
  - desktop 1440px
  - laptop 1280px
  - tablet 820px
  - mobile 390px
- Keyboard review:
  - skip link
  - command palette
  - tabs
  - dialogs
  - kanban move
  - table selection
  - form validation
- Reduced-motion review.
- Public smoke check because `globals.css` can leak into public pages.

## 11. If the external model is unsure

It should stop and ask before:

- Adding Tailwind or any dependency.
- Changing a test.
- Changing a field name or server action.
- Generating Japanese copy.
- Removing a test-facing class or data attribute.
- Editing public marketing pages.
- Editing scanner, PDF, schema, auth guard, or deployment files.
- Changing token values without updating `tokens.ts`, `ui.css`, and `tokens.test.ts` together.
