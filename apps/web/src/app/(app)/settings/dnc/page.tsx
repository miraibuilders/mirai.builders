import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { doNotContact, getDb } from "@mirai/db";
import { getCrmActor } from "@/lib/crm-auth";
import { DNC_KINDS } from "@/lib/dnc";
import { InlineBanner, Input, PageHeader, SectionHeader, Select, SubmitButton, Textarea } from "@/ui";
import { addDncEntry, removeDncEntry } from "./actions";

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
    <>
      <PageHeader title="DNC" description="Admin-only do-not-contact list management." />
      {notice ? <InlineBanner tone="success">{notice}</InlineBanner> : null}

      <SectionHeader title="Add entry" description="Domains, email addresses, and phone numbers are normalized." />
      <form className="ui-form-stack" action={addDncEntry}>
        <label className="field">
          Type
          <Select name="kind" defaultValue="domain" required>
            {DNC_KINDS.map((kind) => (
              <option key={kind} value={kind}>{kind}</option>
            ))}
          </Select>
        </label>
        <label className="field">
          Value
          <Input name="value" required aria-label="DNC value" />
        </label>
        <label className="field">
          Reason
          <Textarea name="reason" required rows={3} aria-label="DNC reason" />
        </label>
        <SubmitButton className="ui-form-submit">Add DNC entry</SubmitButton>
      </form>

      <SectionHeader title="Entries" description={`${entries.length} blocked destination(s).`} />
      <div className="ui-table-viewport ui-table-viewport--plain">
        <table className="ui-table dnc-table">
        <caption className="ui-sr-only">Do-not-contact entries</caption>
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Normalized value</th>
            <th scope="col">Reason</th>
            <th scope="col">Added</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={5}>No DNC entries yet.</td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={`${entry.kind}-${entry.valueNorm}`}>
                <td>{entry.kind}</td>
                <td>{entry.valueNorm}</td>
                <td>{entry.reason}</td>
                <td>{entry.addedAt.toISOString().slice(0, 10)}</td>
                <td>
                  <form action={removeDncEntry}>
                    <input type="hidden" name="kind" value={entry.kind} />
                    <input type="hidden" name="valueNorm" value={entry.valueNorm} />
                    <SubmitButton variant="destructive" size="sm">Remove</SubmitButton>
                  </form>
                </td>
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
    </>
  );
}
