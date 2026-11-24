"use client";

import { DataTable, type DataTableColumn } from "@/ui";

export interface DocumentListRow {
  id: string;
  type: string;
  partnerName: string;
  issueDate: string;
  templateVariant: string;
}

export function DocumentListTable({ rows }: { rows: DocumentListRow[] }) {
  const columns: DataTableColumn<DocumentListRow>[] = [
    { id: "type", header: "Type", sortValue: (row) => row.type, cell: (row) => row.type },
    { id: "recipient", header: "Recipient", sortValue: (row) => row.partnerName, cell: (row) => row.partnerName },
    { id: "issueDate", header: "Issue date", sortValue: (row) => row.issueDate, cell: (row) => row.issueDate },
    {
      id: "variant",
      header: "Variant",
      sortValue: (row) => row.templateVariant,
      cell: (row) => row.templateVariant,
    },
    {
      id: "pdf",
      header: "PDF",
      cell: (row) => <a href={`/api/documents/${row.id}/pdf`} download>Download PDF</a>,
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowId={(row) => row.id}
      className="document-list"
      caption="Documents"
      initialSort={{ id: "issueDate", dir: "desc" }}
      searchPlaceholder="Search documents"
      getSearchText={(row) => [row.type, row.partnerName, row.issueDate, row.templateVariant].join(" ")}
      emptyState={{
        title: "No documents yet",
        description: "Create a document to see it in this list.",
      }}
    />
  );
}
