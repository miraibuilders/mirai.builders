import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { contactRequests, leads, scans } from "@mirai/db";
import { getDb } from "@/lib/db";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { ButtonLink, InlineBanner, PageHeader, SubmitButton } from "@/ui";
import {
  buildLeadsUrl,
  filterLeads,
  isOverdue,
  LEAD_SEGMENTS,
  sortLeads,
  tierForScore,
  type LeadViewRow,
} from "@/lib/lead-view";
import { LeadsBoard } from "./_components/leads-board";
import "./leads.css";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const actor = await getCrmActor();
  if (!actor) redirect("/");

  const params = await searchParams;
  const view = first(params.view) === "table" ? "table" : "board";
  const segment = first(params.segment) || "all";
  const overdue = first(params.overdue) === "1";
  const painSeverity = first(params.pain) || "all";
  const sort = first(params.sort) || "score";
  const direction = first(params.dir) === "asc" ? "asc" : "desc";
  const densityParam = first(params.density);
  const density = densityParam === "compact" || densityParam === "default" ? densityParam : null;
  const withDensity = (url: string) =>
    density ? `${url}${url.includes("?") ? "&" : "?"}density=${encodeURIComponent(density)}` : url;

  const [leadRows, scanRows] = await Promise.all([
    getDb()
      .select({
        id: leads.id,
        company: leads.company,
        websiteUrl: leads.websiteUrl,
        segment: leads.segment,
        stage: leads.stage,
        score: leads.score,
        painFlags: leads.painFlags,
        nextStep: leads.nextStep,
        nextStepDate: leads.nextStepDate,
        preferredTemplate: leads.preferredTemplate,
        reachability: leads.reachability,
        sizeProxy: leads.sizeProxy,
        contactName: contactRequests.name,
        contactEmail: contactRequests.email,
        contactPhone: contactRequests.phone,
      })
      .from(leads)
      .leftJoin(contactRequests, eq(contactRequests.leadId, leads.id))
      .orderBy(desc(leads.createdAt), desc(contactRequests.createdAt)),
    getDb()
      .select({
        leadId: scans.leadId,
        status: scans.status,
        createdAt: scans.createdAt,
      })
      .from(scans)
      .orderBy(desc(scans.createdAt)),
  ]);

  const latestScan = new Map<string, string>();
  for (const scan of scanRows) {
    if (!latestScan.has(scan.leadId)) latestScan.set(scan.leadId, scan.status);
  }

  const byId = new Map<string, LeadViewRow>();
  for (const row of leadRows) {
    if (byId.has(row.id)) continue;
    byId.set(row.id, {
      id: row.id,
      company: row.company,
      websiteUrl: row.websiteUrl,
      segment: row.segment,
      stage: row.stage,
      score: row.score,
      painFlags: row.painFlags,
      nextStep: row.nextStep,
      nextStepDate: row.nextStepDate,
      preferredTemplate: row.preferredTemplate,
      reachability: row.reachability,
      sizeProxy: row.sizeProxy,
      latestScanStatus: latestScan.get(row.id) ?? null,
      contactName: row.contactName,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
    });
  }

  const allLeads = [...byId.values()];
  const leadMetrics = [
    { label: "Total leads", index: "01", value: allLeads.length },
    { label: "Tier A", index: "02", value: allLeads.filter((lead) => tierForScore(lead.score) === "A").length },
    { label: "New stage", index: "03", value: allLeads.filter((lead) => lead.stage === "new").length },
    { label: "Overdue", index: "04", value: allLeads.filter((lead) => isOverdue(lead)).length },
    {
      label: "Pending scans",
      index: "05",
      value: allLeads.filter(
        (lead) => lead.latestScanStatus === "queued" || lead.latestScanStatus === "running",
      ).length,
    },
  ];
  const activeFilterCount =
    (segment !== "all" ? 1 : 0) + (painSeverity !== "all" ? 1 : 0) + (overdue ? 1 : 0);

  const rows = sortLeads(
    filterLeads(allLeads, {
      segment,
      overdue,
      painSeverity,
      sort,
      direction,
    }),
    sort,
    direction,
  );

  if (!canEnqueueScan(actor.role)) {
    return (
      <div className="leads-page">
        <PageHeader title="Leads" />
        <InlineBanner tone="danger" title="Forbidden">You do not have access to CRM leads.</InlineBanner>
      </div>
    );
  }

  return (
    <div className="leads-page">
      <PageHeader
        title="Leads"
        description="Qualified SMB prospects, passive scan readiness, and active deal pipeline."
        actions={
          <>
            <ButtonLink href="/leads/new">New lead</ButtonLink>
            <ButtonLink href="/contact-requests" variant="secondary">Contact requests</ButtonLink>
          </>
        }
      />

      <div className="crm-kpi-strip" aria-label="Lead metrics">
        {leadMetrics.map((metric) => (
          <div className="crm-kpi-card" key={metric.index}>
            <div className="crm-kpi-label">
              <span>{metric.label}</span>
              <span className="ui-mono">{metric.index}</span>
            </div>
            <div className="crm-kpi-value">{metric.value}</div>
          </div>
        ))}
      </div>

      <form className="leads-toolbar crm-filter-bar" method="get" action="/leads">
        <input type="hidden" name="view" value={view} />
        <label className="crm-filter-item">
          <span>Segment</span>
          <select name="segment" defaultValue={segment}>
            <option value="all">all</option>
            {LEAD_SEGMENTS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="crm-filter-item">
          <span>Pain</span>
          <select name="pain" defaultValue={painSeverity}>
            <option value="all">all</option>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
            <option value="none">none</option>
          </select>
        </label>
        <label className="crm-filter-check">
          <input type="checkbox" name="overdue" value="1" defaultChecked={overdue} />
          <span>Overdue only</span>
        </label>
        <SubmitButton variant="secondary">Apply</SubmitButton>
        {activeFilterCount > 0 ? (
          <ButtonLink
            href={withDensity(buildLeadsUrl({
              view,
              segment: "all",
              overdue: false,
              painSeverity: "all",
              sort,
              direction,
            }))}
            variant="ghost"
            size="sm"
          >
            Clear ({activeFilterCount})
          </ButtonLink>
        ) : null}
      </form>

      {activeFilterCount > 0 ? (
        <div className="crm-filter-chips" aria-label="Active filters">
          {segment !== "all" ? (
            <ButtonLink
              size="sm"
              variant="secondary"
              href={withDensity(buildLeadsUrl({
                view,
                segment: "all",
                overdue,
                painSeverity,
                sort,
                direction,
              }))}
            >
              Segment: {segment}
            </ButtonLink>
          ) : null}
          {painSeverity !== "all" ? (
            <ButtonLink
              size="sm"
              variant="secondary"
              href={withDensity(buildLeadsUrl({
                view,
                segment,
                overdue,
                painSeverity: "all",
                sort,
                direction,
              }))}
            >
              Pain: {painSeverity}
            </ButtonLink>
          ) : null}
          {overdue ? (
            <ButtonLink
              size="sm"
              variant="secondary"
              href={withDensity(buildLeadsUrl({
                view,
                segment,
                overdue: false,
                painSeverity,
                sort,
                direction,
              }))}
            >
              Overdue
            </ButtonLink>
          ) : null}
        </div>
      ) : null}

      <div className="ui-tabs ui-view-tabs" role="group" aria-label="Lead view">
        <ButtonLink
          href={withDensity(buildLeadsUrl({ view: "board", segment, overdue, painSeverity, sort, direction }))}
          variant={view === "board" ? "primary" : "secondary"}
          aria-current={view === "board" ? "page" : undefined}
        >
          Board
        </ButtonLink>
        <ButtonLink
          href={withDensity(buildLeadsUrl({ view: "table", segment, overdue, painSeverity, sort, direction }))}
          variant={view === "table" ? "primary" : "secondary"}
          aria-current={view === "table" ? "page" : undefined}
        >
          Table
        </ButtonLink>
      </div>

      <LeadsBoard
        leads={rows}
        view={view}
        segment={segment}
        overdue={overdue}
        painSeverity={painSeverity}
        sort={sort}
        direction={direction}
        canEdit={canEnqueueScan(actor.role)}
      />
    </div>
  );
}
