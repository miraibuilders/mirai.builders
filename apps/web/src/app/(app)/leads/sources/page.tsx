import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { scans } from "@mirai/db";
import { getDb } from "@/lib/db";
import { getCrmActor } from "@/lib/crm-auth";
import { Badge, EmptyState, PageHeader, SectionHeader } from "@/ui";
import "../leads.css";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const actor = await getCrmActor();
  if (!actor || actor.role !== "admin") redirect("/?notice=CRM_FORBIDDEN");

  const rows = await getDb()
    .select({
      id: scans.id,
      leadId: scans.leadId,
      kind: scans.kind,
      status: scans.status,
      createdAt: scans.createdAt,
    })
    .from(scans)
    .orderBy(desc(scans.createdAt));

  const statusCounts = rows.reduce<Record<string, number>>((counts, row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
    return counts;
  }, {});
  const health = [
    { label: "Queued", index: "01", value: statusCounts.queued ?? 0 },
    { label: "Running", index: "02", value: statusCounts.running ?? 0 },
    { label: "Done", index: "03", value: statusCounts.done ?? 0 },
    { label: "Failed", index: "04", value: statusCounts.failed ?? 0 },
  ];

  return (
    <div className="lead-sources-page">
      <PageHeader
        title="Sources"
        description="Admin-only scan pipeline health and recent scanner activity."
      />
      <div className="crm-kpi-strip" aria-label="Scanner health">
        {health.map((item) => (
          <div className="crm-kpi-card" key={item.index}>
            <div className="crm-kpi-label">
              <span>{item.label}</span>
              <span className="ui-mono">{item.index}</span>
            </div>
            <div className="crm-kpi-value">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="crm-panel-grid">
        <section className="crm-panel">
          <SectionHeader title="Pipeline load" description="Queued and running scanner work." />
          <p className="ui-mono crm-panel-metric">{(statusCounts.queued ?? 0) + (statusCounts.running ?? 0)} active</p>
        </section>
        <section className="crm-panel">
          <SectionHeader title="Completion rate" description="Done scans over all recorded runs." />
          <p className="ui-mono crm-panel-metric">
            {Math.round(((statusCounts.done ?? 0) / Math.max(rows.length, 1)) * 100)}%
          </p>
        </section>
      </div>
      <SectionHeader title="Pipeline status" />
      <div className="ui-table-viewport ui-table-viewport--plain">
        <table className="ui-table">
        <caption className="ui-sr-only">Scan counts by status</caption>
        <thead>
          <tr>
            <th scope="col">Status</th>
            <th scope="col">Scans</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(statusCounts).length === 0 ? (
            <tr><td colSpan={2}>No scans recorded yet.</td></tr>
          ) : Object.entries(statusCounts).map(([status, count]) => (
            <tr key={status}>
              <td><Badge tone="info">{status}</Badge></td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <SectionHeader title="Recent scans" description="Newest scanner runs across all leads." />
      {rows.length === 0 ? (
        <EmptyState
          icon="refresh"
          title="No scans yet"
          description="Trigger a lead scan to populate source health."
        />
      ) : (
        <div className="ui-table-viewport ui-table-viewport--plain">
          <table className="ui-table">
          <caption className="ui-sr-only">Recent scans</caption>
          <thead>
            <tr>
              <th scope="col">Lead</th>
              <th scope="col">Kind</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 50).map((row) => (
              <tr key={row.id}>
                <td><Link href={`/leads/${row.leadId}`}>{row.leadId}</Link></td>
                <td>{row.kind}</td>
                <td><Badge tone={row.status === "failed" ? "danger" : "info"}>{row.status}</Badge></td>
                <td className="ui-mono">{row.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
