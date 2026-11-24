import Link from "next/link";
import {
  buildLeadsUrl,
  tierForScore,
  topPainFlag,
  type LeadViewRow,
} from "@/lib/lead-view";

export function LeadsTable({
  leads,
  view,
  segment,
  overdue,
  painSeverity,
  sort,
  direction,
}: {
  leads: LeadViewRow[];
  view: string;
  segment: string;
  overdue: boolean;
  painSeverity: string;
  sort: string;
  direction: "asc" | "desc";
}) {
  const sortUrl = (column: string) => buildLeadsUrl({
    view,
    segment,
    overdue,
    painSeverity,
    sort: column,
    direction: sort === column && direction === "asc" ? "desc" : "asc",
  });

  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th><Link href={sortUrl("company")}>Company</Link></th>
          <th><Link href={sortUrl("segment")}>Segment</Link></th>
          <th><Link href={sortUrl("score")}>Score</Link></th>
          <th>Tier</th>
          <th><Link href={sortUrl("stage")}>Stage</Link></th>
          <th>Pain</th>
          <th><Link href={sortUrl("nextStepDate")}>Next date</Link></th>
          <th>Contact</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td><Link href={`/leads/${lead.id}`}>{lead.company}</Link></td>
            <td>{lead.segment}</td>
            <td>{lead.score}</td>
            <td>{tierForScore(lead.score)}</td>
            <td>{lead.stage}</td>
            <td>{topPainFlag(lead.painFlags)}</td>
            <td>{lead.nextStepDate ?? "-"}</td>
            <td>
              {lead.contactName ?? "-"}
              {lead.contactEmail ? ` / ${lead.contactEmail}` : ""}
              {lead.contactPhone ? ` / ${lead.contactPhone}` : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
