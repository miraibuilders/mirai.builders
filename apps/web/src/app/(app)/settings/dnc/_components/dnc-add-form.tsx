"use client";

import { useState } from "react";
import { DNC_KINDS, normalizeDncValue, type DncKind } from "@/lib/dnc";
import { Input, Select, SubmitButton, Textarea } from "@/ui";
import { addDncEntry } from "../actions";

export function DncAddForm() {
  const [kind, setKind] = useState<DncKind>("domain");
  const [value, setValue] = useState("");
  const normalized = normalizeDncValue(kind, value);

  return (
    <form className="dnc-form ui-form-stack" action={addDncEntry}>
      <label className="field">
        Type
        <Select
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as DncKind)}
          required
        >
          {DNC_KINDS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </Select>
      </label>
      <label className="field">
        Value
        <Input name="value" value={value} onChange={(event) => setValue(event.target.value)} required aria-label="DNC value" />
      </label>
      <label className="field">
        Reason
        <Textarea name="reason" rows={3} required aria-label="DNC reason" />
      </label>
      <div className="dnc-normalized">
        <span className="dnc-normalized-label">Normalized preview</span>
        <output className="ui-mono" aria-live="polite">
          {normalized ?? "Enter a valid value to preview normalization"}
        </output>
      </div>
      <SubmitButton className="ui-form-submit">Add DNC entry</SubmitButton>
    </form>
  );
}
