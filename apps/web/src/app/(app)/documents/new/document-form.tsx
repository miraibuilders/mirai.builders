"use client";

import { useActionState, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import {
  Badge,
  Button,
  Icon,
  InlineBanner,
  Input,
  SectionHeader,
  Select,
  SubmitButton,
  Textarea,
} from "@/ui";

import { createDocument, type DocumentFormState } from "./actions";

interface LeadOption {
  id: string;
  company: string;
  preferredTemplate: string | null;
}

interface DocumentFormProps {
  leads: LeadOption[];
}

type LineItem = {
  key: number;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
};

const initialState: DocumentFormState = { status: "idle" };
const documentTypes = [
  { value: "invoice", label: "Invoice" },
  { value: "quote", label: "Quote" },
  { value: "nda", label: "NDA" },
  { value: "acceptance", label: "Acceptance" },
];
const variants = ["branded", "mono"];
const variantLabels: Record<string, string> = { branded: "Branded", mono: "Mono" };

function asNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="ui-field">
      <label className="ui-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function DocumentForm({ leads }: DocumentFormProps) {
  const [state, action] = useActionState(createDocument, initialState);
  const [variant, setVariant] = useState("branded");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { key: 0, description: "", quantity: "1", unitPrice: "", taxRate: "10" },
  ]);
  const nextKey = useRef(1);

  function handleLeadChange(event: ChangeEvent<HTMLSelectElement>) {
    const leadId = event.target.value;
    setSelectedLeadId(leadId);
    const selected = leads.find((lead) => lead.id === leadId);
    if (selected?.preferredTemplate && variants.includes(selected.preferredTemplate)) {
      setVariant(selected.preferredTemplate);
    }
  }

  function updateLine(key: number, field: Exclude<keyof LineItem, "key">, value: string) {
    setLineItems((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  }

  function addLine() {
    setLineItems((current) => [
      ...current,
      { key: nextKey.current++, description: "", quantity: "1", unitPrice: "", taxRate: "10" },
    ]);
  }

  function removeLine(key: number) {
    setLineItems((current) => (key === 0 ? current : current.filter((item) => item.key !== key)));
  }

  const subtotal = lineItems.reduce((total, item) => total + asNumber(item.quantity) * asNumber(item.unitPrice), 0);
  const tax = lineItems.reduce(
    (total, item) => total + asNumber(item.quantity) * asNumber(item.unitPrice) * (asNumber(item.taxRate) / 100),
    0,
  );
  const total = subtotal + tax;

  return (
    <form action={action} className="document-form ui-form-stack">
      {state.status !== "idle" ? (
        <div className={`document-status ${state.status}`} role={state.status === "success" ? "status" : "alert"}>
          {state.status === "success" ? (
            <InlineBanner tone="success" title="Document created">
              <span>
                {state.message ?? "Document created."}{" "}
                {state.documentId ? (
                  <a className="ui-mono" href={`/api/documents/${state.documentId}/pdf`} download>
                    Download PDF
                  </a>
                ) : null}
              </span>
            </InlineBanner>
          ) : (
            <InlineBanner tone="danger" title="Document not created">
              <span>{state.message ?? "Please correct the fields below."}</span>
            </InlineBanner>
          )}
        </div>
      ) : null}

      <section className="ui-form-section">
        <SectionHeader title="Document details" description="Choose the type and the output template." />
        <div className="ui-form-grid-2">
          <Field label="Type" htmlFor="type">
            <Select id="type" name="type" defaultValue="invoice" required>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Variant" htmlFor="templateVariant">
            <div className="document-variant-cell">
              <Select
                id="templateVariant"
                name="templateVariant"
                value={variant}
                onChange={(event) => setVariant(event.target.value)}
                required
              >
                {variants.map((option) => (
                  <option key={option} value={option}>
                    {variantLabels[option]}
                  </option>
                ))}
              </Select>
              <Badge tone={variant === "branded" ? "brand" : "neutral"}>{variantLabels[variant]}</Badge>
            </div>
          </Field>
          <Field label="Lead" htmlFor="leadId">
            <Select id="leadId" name="leadId" value={selectedLeadId} onChange={handleLeadChange}>
              <option value="">No lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.company}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Issuer" htmlFor="issuerName">
            <Input id="issuerName" name="issuerName" type="text" maxLength={200} />
          </Field>
          <Field label="Issue date" htmlFor="issueDate">
            <Input id="issueDate" name="issueDate" type="date" required />
          </Field>
          <Field label="Recipient" htmlFor="partnerName">
            <Input id="partnerName" name="partnerName" type="text" required maxLength={200} />
          </Field>
        </div>
        <div className="ui-form-grid-2">
          <Field label="Invoice number" htmlFor="invoiceNumber">
            <Input id="invoiceNumber" name="invoiceNumber" type="text" maxLength={80} />
          </Field>
          <Field label="Registration number" htmlFor="registrationNumber">
            <Input id="registrationNumber" name="registrationNumber" type="text" maxLength={20} />
          </Field>
          <Field label="Transaction date" htmlFor="transactionDate">
            <Input id="transactionDate" name="transactionDate" type="date" />
          </Field>
          <Field label="Due date" htmlFor="dueDate">
            <Input id="dueDate" name="dueDate" type="date" />
          </Field>
        </div>
      </section>

      <section className="ui-form-section">
        <SectionHeader
          title="Line items"
          description="Amounts are calculated from quantity, unit price, and tax rate."
        />
        <div className="document-line-matrix">
          <div className="document-line-head" aria-hidden="true">
            <span>Description</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span>Tax %</span>
            <span />
          </div>
          {lineItems.map((item, index) => (
            <div className="document-line-row" key={item.key}>
              <Field label={`Description ${index + 1}`} htmlFor={`description-${item.key}`}>
                <Input
                  id={`description-${item.key}`}
                  name="item_description[]"
                  type="text"
                  value={item.description}
                  aria-label={`Line ${index + 1} description`}
                  onChange={(event) => updateLine(item.key, "description", event.target.value)}
                />
              </Field>
              <Field label={`Qty ${index + 1}`} htmlFor={`quantity-${item.key}`}>
                <Input
                  id={`quantity-${item.key}`}
                  name="item_quantity[]"
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  aria-label={`Line ${index + 1} quantity`}
                  onChange={(event) => updateLine(item.key, "quantity", event.target.value)}
                />
              </Field>
              <Field label={`Unit price ${index + 1}`} htmlFor={`unit-price-${item.key}`}>
                <Input
                  id={`unit-price-${item.key}`}
                  name="item_unit_price[]"
                  type="number"
                  min="0"
                  step="1"
                  value={item.unitPrice}
                  aria-label={`Line ${index + 1} unit price`}
                  onChange={(event) => updateLine(item.key, "unitPrice", event.target.value)}
                />
              </Field>
              <Field label={`Tax ${index + 1}`} htmlFor={`tax-${item.key}`}>
                <Input
                  id={`tax-${item.key}`}
                  name="item_tax_rate[]"
                  type="number"
                  min="0"
                  step="1"
                  value={item.taxRate}
                  aria-label={`Line ${index + 1} tax rate`}
                  onChange={(event) => updateLine(item.key, "taxRate", event.target.value)}
                />
              </Field>
              <Button
                className="document-line-remove"
                type="button"
                size="sm"
                variant="secondary"
                aria-label={`Remove line ${index + 1}`}
                onClick={() => removeLine(item.key)}
              >
                Remove
              </Button>
              <span className="document-line-amount ui-mono">
                {(asNumber(item.quantity) * asNumber(item.unitPrice)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" icon="plus" onClick={addLine}>
          Add line
        </Button>
      </section>

      <section className="ui-form-section">
        <SectionHeader title="Notes" description="Internal notes never appear on the generated PDF." />
        <Field label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={4} placeholder="Optional notes" />
        </Field>
      </section>

      <section className="document-totals" aria-label="Document totals">
        <div>
          <div className="ui-text-muted">Subtotal</div>
          <div className="ui-mono">{subtotal.toFixed(2)}</div>
        </div>
        <div>
          <div className="ui-text-muted">Tax</div>
          <div className="ui-mono">{tax.toFixed(2)}</div>
        </div>
        <div>
          <div className="ui-text-muted">Total</div>
          <strong className="ui-mono">{total.toFixed(2)}</strong>
        </div>
      </section>

      <div className="document-form-actions">
        <SubmitButton className="ui-form-submit">
          <Icon name="file" />
          Create document
        </SubmitButton>
      </div>
    </form>
  );
}
