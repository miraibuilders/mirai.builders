import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { doNotContact, getDb } from "@mirai/db";
import { getCrmActor } from "@/lib/crm-auth";
import { Badge, EmptyState, InlineBanner, PageHeader, SectionHeader, SubmitButton } from "@/ui";
import { removeDncEntry } from "./actions";
import { DncAddForm } from "./_components/dnc-add-form";

import "./dnc.css";

export const dynamic = "force-dynamic";

export default async function DncPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [actor, { notice }] = await Promise.all([getCrmActor(), searchParams]);
  if (!actor || actor.role !== "admin") redirect("/?notice=CRM_FORBIDDEN");
  const entries = await getDb().select().from(doNotContact).orderBy(desc(doNotContact.addedAt));

  return (
    <div className="dnc-page">
      <PageHeader
        title="DNC"
        description="Admin-only do-not-contact list management."
        actions={<Badge tone="danger" icon="shield">Admin only</Badge>}
      />
      {notice ? <div className="lead-notice"><InlineBanner tone="success">{notice}</InlineBanner></div> : null}
      <div className="dnc-layout">
        <section className="dnc-card">
          <SectionHeader
            title="Add entry"
            description="Domains, email addresses, and phone numbers are normalized."
          />
          <DncAddForm />
        </section>
        <section className="dnc-card dnc-entries">
          <SectionHeader title="Entries" description={`${entries.length} blocked destination(s).`} />
          <div className="ui-table-viewport ui-table-viewport--plain">
            <table className="ui-table dnc-table">
              <caption className="ui-sr-only">Do-not-contact entries</caption>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Normalized value</th>
                  <th>Reason</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState title="No DNC entries yet." description="Add a blocked destination to get started." />
                    </td>
                  </tr>
                ) : entries.map((entry) => (
                  <tr key={`${entry.kind}-${entry.valueNorm}`}>
                    <td><Badge tone="warning" className="ui-mono">{entry.kind}</Badge></td>
                    <td className="ui-mono">{entry.valueNorm}</td>
                    <td className="dnc-reason">{entry.reason}</td>
                    <td className="ui-mono">{entry.addedAt.toISOString().slice(0, 10)}</td>
                    <td>
                      <form action={removeDncEntry}>
                        <input type="hidden" name="kind" value={entry.kind} />
                        <input type="hidden" name="valueNorm" value={entry.valueNorm} />
                        <SubmitButton variant="destructive" size="sm">Remove</SubmitButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
