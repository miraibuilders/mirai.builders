"use client";

import Link from "next/link";
import { DataTable, SubmitButton, type DataTableColumn } from "@/ui";
import { promoteContactRequest } from "../actions";

export interface ContactRequestRow {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  createdAt: Date;
  leadId: string | null;
  leadCompany: string | null;
}

export function ContactRequestsTable({ rows }: { rows: ContactRequestRow[] }) {
  const columns: DataTableColumn<ContactRequestRow>[] = [
    {
      id: "received",
      header: "Received",
      sortValue: (row) => row.createdAt.getTime(),
      cell: (row) => row.createdAt.toISOString(),
    },
    { id: "name", header: "Name", sortValue: (row) => row.name, cell: (row) => row.name },
    { id: "company", header: "Company", sortValue: (row) => row.company ?? "", cell: (row) => row.company ?? "-" },
    { id: "email", header: "Email", sortValue: (row) => row.email, cell: (row) => row.email },
    { id: "phone", header: "Phone", sortValue: (row) => row.phone ?? "", cell: (row) => row.phone ?? "-" },
    { id: "message", header: "Message", sortValue: (row) => row.message ?? "", cell: (row) => row.message ?? "-" },
    {
      id: "lead",
      header: "Lead",
      cell: (row) => row.leadId
        ? <Link href={`/leads/${row.leadId}`}>{row.leadCompany ?? row.leadId}</Link>
        : "-",
    },
    {
      id: "action",
      header: "Action",
      cell: (row) => row.leadId
        ? <span>Promoted</span>
        : (
          <form action={promoteContactRequest}>
            <input type="hidden" name="requestId" value={row.id} />
            <SubmitButton>Promote to lead</SubmitButton>
          </form>
        ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowId={(row) => row.id}
      rowAttributes={(row) => ({ "data-contact-request-id": row.id })}
      className="contact-requests-table"
      caption="Contact requests"
      initialSort={{ id: "received", dir: "desc" }}
      searchPlaceholder="Search contact requests"
      getSearchText={(row) => [
        row.name,
        row.company,
        row.email,
        row.phone,
        row.message,
        row.leadCompany,
      ].filter(Boolean).join(" ")}
      emptyState={{
        title: "No contact requests",
        description: "Incoming form submissions will appear here.",
      }}
    />
  );
}
