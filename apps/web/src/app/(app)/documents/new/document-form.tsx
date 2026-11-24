"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { createDocument, type DocumentFormState } from "./actions";
import type { DocumentTemplateVariant } from "@/lib/documents/types";
import { Button, InlineBanner, Input, Select } from "@/ui";

type LeadOption = {
  id: string;
  company: string;
  preferredTemplate: DocumentTemplateVariant | null;
};

type LineItemRow = { key: number };

const initialState: DocumentFormState = { status: "idle" };

export function DocumentForm({ leads }: { leads: LeadOption[] }) {
  const [state, action, pending] = useActionState(createDocument, initialState);
  const [variant, setVariant] = useState<DocumentTemplateVariant>("branded");
  const [rows, setRows] = useState<LineItemRow[]>([{ key: 0 }]);

  function handleLeadChange(event: ChangeEvent<HTMLSelectElement>) {
    const lead = leads.find((item) => item.id === event.target.value);
    if (lead?.preferredTemplate) setVariant(lead.preferredTemplate);
  }

  return (
    <form action={action} className="document-form ui-form-stack">
      <div className="document-grid">
        <div className="field">
          <label htmlFor="type">Type</label>
          <Select id="type" name="type" defaultValue="invoice" required>
            <option value="invoice">Invoice</option>
            <option value="quote">Quote</option>
            <option value="nda">NDA</option>
            <option value="acceptance">Acceptance</option>
          </Select>
        </div>
        <div className="field">
          <label htmlFor="leadId">Lead</label>
          <Select id="leadId" name="leadId" onChange={handleLeadChange}>
            <option value="">No lead</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.company}
              </option>
            ))}
          </Select>
        </div>
        <div className="field">
          <label htmlFor="templateVariant">Variant</label>
          <Select
            id="templateVariant"
            name="templateVariant"
            value={variant}
            onChange={(event) => setVariant(event.target.value as DocumentTemplateVariant)}
            required
          >
            <option value="branded">Branded</option>
            <option value="mono">Mono</option>
          </Select>
        </div>
        <div className="field">
          <label htmlFor="partnerName">Recipient</label>
          <Input id="partnerName" name="partnerName" type="text" required maxLength={200} />
        </div>
        <div className="field">
          <label htmlFor="issueDate">Issue date</label>
          <Input id="issueDate" name="issueDate" type="date" required />
        </div>
        <div className="field">
          <label htmlFor="dueDate">Due date</label>
          <Input id="dueDate" name="dueDate" type="date" />
        </div>
        <div className="field">
          <label htmlFor="issuerName">Issuer</label>
          <Input id="issuerName" name="issuerName" type="text" maxLength={200} />
        </div>
        <div className="field">
          <label htmlFor="invoiceNumber">Invoice number</label>
          <Input id="invoiceNumber" name="invoiceNumber" type="text" maxLength={80} />
        </div>
        <div className="field">
          <label htmlFor="transactionDate">Transaction date</label>
          <Input id="transactionDate" name="transactionDate" type="date" />
        </div>
        <div className="field">
          <label htmlFor="registrationNumber">Registration number</label>
          <Input id="registrationNumber" name="registrationNumber" type="text" maxLength={20} />
        </div>
      </div>

      <fieldset className="line-items">
        <legend>Line items</legend>
        {rows.map((row, index) => (
          <div className="line-item" key={row.key}>
            <Input name="item_description[]" type="text" placeholder="Description" aria-label={`Line ${index + 1} description`} />
            <Input name="item_quantity[]" type="number" min="1" step="1" placeholder="Quantity" aria-label={`Line ${index + 1} quantity`} />
            <Input name="item_unit_price[]" type="number" min="0" step="1" placeholder="Unit price" aria-label={`Line ${index + 1} unit price`} />
            <Input name="item_tax_rate[]" type="number" min="0" step="1" placeholder="Tax rate" aria-label={`Line ${index + 1} tax rate`} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label={`Remove line ${index + 1}`}
              onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
            >
              Remove
            </Button>
            <span aria-hidden="true">{index + 1}</span>
          </div>
        ))}
        <Button variant="secondary" size="sm" type="button" onClick={() => setRows((current) => [...current, { key: Date.now() }])}>
          Add line
        </Button>
      </fieldset>

      {state.status === "success" && state.documentId ? (
        <div className="document-status success" role="status">
          <InlineBanner tone="success" title="Document created">
            <a href={`/api/documents/${state.documentId}/pdf`} download>Download PDF</a>
          </InlineBanner>
        </div>
      ) : null}
      {state.status === "error" ? (
        <div className="document-status error" role="alert">
          <InlineBanner tone="danger" title="Document not created">{state.message}</InlineBanner>
        </div>
      ) : null}

      <Button type="submit" className="ui-form-submit" loading={pending}>
        Create document
      </Button>
    </form>
  );
}
