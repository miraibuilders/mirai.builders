import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { scans } from "@mirai/db";
import { getDb } from "@/lib/db";
import { getCrmActor } from "@/lib/crm-auth";
import { Badge, EmptyState, PageHeader, SectionHeader } from "@/ui";

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

  return (
    <>
      <PageHeader
        title="Sources"
        description="Admin-only scan pipeline health and recent scanner activity."
      />
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
                <td><Badge tone="info">{row.status}</Badge></td>
                <td>{row.createdAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </>
  );
}
