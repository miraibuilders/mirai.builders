import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { contactRequests, leads, scans } from "@mirai/db";
import { getDb } from "@/lib/db";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { ButtonLink, InlineBanner, PageHeader, SubmitButton } from "@/ui";
import {
  buildLeadsUrl,
  filterLeads,
  LEAD_SEGMENTS,
  sortLeads,
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

  const rows = sortLeads(
    filterLeads([...byId.values()], {
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
        description="Review scored leads, manage stages, and trigger scans."
        actions={
          <>
            <ButtonLink href="/leads/new">New lead</ButtonLink>
            <ButtonLink href="/contact-requests" variant="secondary">Contact requests</ButtonLink>
          </>
        }
      />
      <form className="leads-toolbar" method="get" action="/leads">
        <input type="hidden" name="view" value={view} />
        <label>
          Segment
          <select name="segment" defaultValue={segment}>
            <option value="all">all</option>
            {LEAD_SEGMENTS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Pain
          <select name="pain" defaultValue={painSeverity}>
            <option value="all">all</option>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
            <option value="none">none</option>
          </select>
        </label>
        <label>
          Overdue
          <input type="checkbox" name="overdue" value="1" defaultChecked={overdue} />
        </label>
        <SubmitButton variant="secondary">Apply</SubmitButton>
      </form>
      <div className="ui-tabs ui-view-tabs" role="group" aria-label="Lead view">
        <ButtonLink
          href={buildLeadsUrl({ view: "board", segment, overdue, painSeverity, sort, direction })}
          variant={view === "board" ? "primary" : "secondary"}
          aria-current={view === "board" ? "page" : undefined}
        >
          Board
        </ButtonLink>
        <ButtonLink
          href={buildLeadsUrl({ view: "table", segment, overdue, painSeverity, sort, direction })}
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
