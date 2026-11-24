"use client";

import { LEAD_SEGMENTS, REACHABILITY_OPTIONS, TEMPLATE_OPTIONS } from "@/lib/lead-view";
import { Button, FormField, Input, Select, Textarea } from "@/ui";

export type LeadFormValues = {
  company: string;
  websiteUrl: string;
  segment: string;
  reachability: string;
  sizeProxy: number;
  nextStep: string;
  nextStepDate: string;
  preferredTemplate: string;
  note: string;
};

export function LeadForm({
  action,
  initial,
  submitLabel,
  hiddenValues,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: LeadFormValues;
  submitLabel: string;
  hiddenValues?: Record<string, string>;
}) {
  return (
    <form action={action} className="lead-form ui-form-stack">
      {Object.entries(hiddenValues ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <FormField label="Company" required>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="company" required defaultValue={initial?.company ?? ""} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="Website">
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="websiteUrl" type="url" defaultValue={initial?.websiteUrl ?? ""} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="Segment">
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="segment" defaultValue={initial?.segment ?? "professional_office"} aria-describedby={describedBy} aria-invalid={invalid}>
            {LEAD_SEGMENTS.map((segment) => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </Select>
        )}
      </FormField>
      <FormField label="Reachability">
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="reachability" defaultValue={initial?.reachability ?? "cold_list"} aria-describedby={describedBy} aria-invalid={invalid}>
            {REACHABILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        )}
      </FormField>
      <FormField label="Size proxy">
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="sizeProxy" type="number" min="0" max="5" defaultValue={initial?.sizeProxy ?? 0} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="Next step">
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="nextStep" defaultValue={initial?.nextStep ?? ""} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="Next step date">
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="nextStepDate" type="date" defaultValue={initial?.nextStepDate ?? ""} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="Preferred template">
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="preferredTemplate" defaultValue={initial?.preferredTemplate ?? "branded"} aria-describedby={describedBy} aria-invalid={invalid}>
            {TEMPLATE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        )}
      </FormField>
      <FormField label="Note">
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} name="note" defaultValue={initial?.note ?? ""} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <Button type="submit" className="ui-form-submit">{submitLabel}</Button>
    </form>
  );
}
