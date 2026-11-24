"use client";

import { Badge, ButtonLink, DataTable, Icon, type DataTableColumn } from "@/ui";

export type DocumentRow = {
  id: string;
  type: string;
  partnerName: string;
  issueDate: string;
  templateVariant: string;
};

interface DocumentListTableProps {
  rows: DocumentRow[];
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

export function DocumentListTable({ rows }: DocumentListTableProps) {
  const columns: DataTableColumn<DocumentRow>[] = [
    {
      id: "type",
      header: "Type",
      cell: (row) => (
        <span className="document-type-cell">
          <Icon name="file" />
          <span>{row.type}</span>
        </span>
      ),
    },
    {
      id: "recipient",
      header: "Recipient",
      cell: (row) => <span className="ui-font-medium">{row.partnerName}</span>,
    },
    {
      id: "issueDate",
      header: "Issue date",
      cell: (row) => <span className="ui-mono">{formatDate(row.issueDate)}</span>,
      sortValue: (row) => formatDate(row.issueDate),
    },
    {
      id: "variant",
      header: "Variant",
      cell: (row) => (
        <Badge tone={row.templateVariant === "branded" ? "brand" : "neutral"}>
          {row.templateVariant}
        </Badge>
      ),
    },
    {
      id: "pdf",
      header: "PDF",
      cell: (row) => (
        <ButtonLink
          className="document-download"
          href={`/api/documents/${row.id}/pdf`}
          variant="ghost"
          size="sm"
          download
          aria-label={`Download PDF for ${row.partnerName}`}
        >
          <Icon name="download" />
          Download PDF
        </ButtonLink>
      ),
    },
  ];

  return (
    <DataTable
      className="document-list"
      rows={rows}
      columns={columns}
      rowId={(row) => row.id}
      caption="Documents"
      initialSort={{ id: "issueDate", dir: "desc" }}
      searchPlaceholder="Search documents"
      getSearchText={(row) => [row.type, row.partnerName, row.issueDate, row.templateVariant].join(" ")}
      emptyState={{
        title: "No documents yet.",
        description: "Create a document to see it in this list.",
        action: <ButtonLink href="/documents/new">New document</ButtonLink>,
      }}
    />
  );
}
