"use client";

import { useActionState, useState, type ChangeEvent, type ReactNode } from "react";
import { saveSiteSettings } from "./actions";
import { Button, ErrorSummary, InlineBanner, Input, Select, Tabs, Textarea } from "@/ui";
import { initialSiteFormState, type SiteFormState } from "./form-state";

type Locale = "ja" | "en";

type TierRow = {
  nameJa: string;
  nameEn: string;
  price: string;
  noteJa: string;
  noteEn: string;
  sortOrder: string;
};

type CaseRow = {
  status: string;
  metaJa: string;
  metaEn: string;
  titleJa: string;
  titleEn: string;
  summaryJa: string;
  summaryEn: string;
  imageUrl: string;
  imageWidth: string;
  imageHeight: string;
  sortOrder: string;
};

export type SiteFormProps = {
  values: Record<string, string>;
  tiers: TierRow[];
  caseRows: CaseRow[];
};

function fieldError(state: SiteFormState, name: string) {
  const error = state.errors[name];
  return error ? (
    <p className="cms-field-error" id={`site-error-${name}`} data-testid={`error-${name}`}>
      {error}
    </p>
  ) : null;
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="ui-field site-field">
      <div className="site-field-heading">
        <label className="ui-field-label" htmlFor={htmlFor}>
          {label}
        </label>
        {hint ? (
          <span className="site-char-hint ui-mono" aria-hidden="true">
            {hint}
          </span>
        ) : null}
      </div>
      {children}
      {error}
    </div>
  );
}

export function SiteForm({ values, tiers, caseRows }: SiteFormProps) {
  const [state, formAction, pending] = useActionState(saveSiteSettings, initialSiteFormState);
  const [locale, setLocale] = useState<Locale>("ja");
  const [current, setCurrent] = useState(values);
  const [tierList, setTierList] = useState(tiers);
  const [caseList, setCaseList] = useState(caseRows);
  const errorLinks = Object.entries(state.errors).map(([name, message]) => ({
    id: `site-error-${name}`,
    message,
  }));

  function set(name: string, value: string) {
    setCurrent((previous) => ({ ...previous, [name]: value }));
  }

  function field(name: string, label: string, options: { textarea?: boolean } = {}) {
    const id = `site-${name}`;
    const value = current[name] ?? "";
    const common = {
      id,
      name,
      value,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(name, event.target.value),
      "aria-label": label,
      "aria-invalid": Boolean(state.errors[name]),
    };
    return (
      <Field
        label={label}
        htmlFor={id}
        hint={`${value.length} chars`}
        error={fieldError(state, name)}
      >
        {options.textarea ? (
          <Textarea {...common} rows={3} />
        ) : (
          <Input {...common} type={name === "offerPrice" ? "number" : "text"} />
        )}
      </Field>
    );
  }

  function fileField(name: string, label: string) {
    const id = `site-${name}`;
    return (
      <Field label={label} htmlFor={id} error={fieldError(state, name)}>
        <Input id={id} type="file" name={name} accept="image/jpeg,image/png,image/webp" aria-label={label} />
      </Field>
    );
  }

  function move<T>(list: T[], index: number, offset: number): T[] {
    const next = [...list];
    const target = index + offset;
    if (target < 0 || target >= next.length) return next;
    [next[index], next[target]] = [next[target]!, next[index]!];
    return next;
  }

  function updateTier(index: number, key: keyof TierRow, value: string) {
    setTierList((list) => list.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function updateCase(index: number, key: keyof CaseRow, value: string) {
    setCaseList((list) => list.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  return (
    <form className="cms-form site-form" action={formAction}>
      {state.status === "error" ? (
        <div data-testid="form-error">
          <InlineBanner tone="danger">{state.message}</InlineBanner>
        </div>
      ) : null}
      <ErrorSummary errors={errorLinks} />

      <nav className="ui-site-rail" aria-label="Site settings sections">
        <span className="ui-site-rail-title">Sections</span>
        <a href="#site-locale">Locale copy</a>
        <a href="#site-pricing">Pricing tiers</a>
        <a href="#site-cases">Case studies</a>
      </nav>

      <div className="site-form-main">
        <section className="site-locale-section" id="site-locale">
          <Tabs
            label="Site settings locale"
            value={locale}
            onValueChange={(value) => setLocale(value as Locale)}
            items={[
              { id: "ja", label: "日本語" },
              { id: "en", label: "English" },
            ]}
          />

          <section
            className="site-section"
            data-locale="ja"
            id="ui-tabpanel-ja"
            role="tabpanel"
            aria-labelledby="ui-tab-ja"
            hidden={locale !== "ja"}
          >
            <h2>Contact (日本語)</h2>
            <div className="site-field-grid">
              {field("phone", "Phone")}
              {field("emailJa", "Email (ja)")}
              {field("addressJa", "Address (ja)")}
            </div>

            <h2>Hero (日本語)</h2>
            <div className="site-field-grid">
              {field("heroHeadlineJa", "Hero headline (ja)")}
              {field("heroSubheadlineJa", "Hero subheadline (ja)", { textarea: true })}
              {field("heroCtaJa", "Hero CTA (ja)")}
              {field("heroImageAltJa", "Hero image alt (ja)")}
              {fileField("heroImage", "Hero image")}
              <Input type="hidden" name="heroImageUrl" value={current.heroImageUrl ?? ""} readOnly />
              <Input type="hidden" name="heroImageWidth" value={current.heroImageWidth ?? ""} readOnly />
              <Input type="hidden" name="heroImageHeight" value={current.heroImageHeight ?? ""} readOnly />
            </div>

            <h2>Offer (日本語)</h2>
            <div className="site-field-grid">
              {field("offerNameJa", "Offer name (ja)")}
              {field("offerDescriptionJa", "Offer description (ja)", { textarea: true })}
              {field("offerPrice", "Offer price")}
            </div>

            <h2>About author (日本語)</h2>
            <div className="site-field-grid">
              {field("aboutAuthorNameJa", "Author name (ja)")}
              {field("aboutAuthorBioJa", "Author bio (ja)", { textarea: true })}
              {fileField("authorImage", "Author image")}
              <Input type="hidden" name="aboutAuthorImageUrl" value={current.aboutAuthorImageUrl ?? ""} readOnly />
              <Input type="hidden" name="aboutAuthorImageWidth" value={current.aboutAuthorImageWidth ?? ""} readOnly />
              <Input type="hidden" name="aboutAuthorImageHeight" value={current.aboutAuthorImageHeight ?? ""} readOnly />
            </div>

            <h2>Footer (日本語)</h2>
            {field("footerCopyrightJa", "Footer copyright (ja)")}
          </section>

          <section
            className="site-section"
            data-locale="en"
            id="ui-tabpanel-en"
            role="tabpanel"
            aria-labelledby="ui-tab-en"
            hidden={locale !== "en"}
          >
            <h2>Contact (English)</h2>
            <div className="site-field-grid">
              {field("emailEn", "Email (en)")}
              {field("addressEn", "Address (en)")}
            </div>

            <h2>Hero (English)</h2>
            <div className="site-field-grid">
              {field("heroHeadlineEn", "Hero headline (en)")}
              {field("heroSubheadlineEn", "Hero subheadline (en)", { textarea: true })}
              {field("heroCtaEn", "Hero CTA (en)")}
            </div>

            <h2>Offer (English)</h2>
            <div className="site-field-grid">
              {field("offerNameEn", "Offer name (en)")}
              {field("offerDescriptionEn", "Offer description (en)", { textarea: true })}
            </div>

            <h2>About author (English)</h2>
            <div className="site-field-grid">
              {field("aboutAuthorNameEn", "Author name (en)")}
              {field("aboutAuthorBioEn", "Author bio (en)", { textarea: true })}
            </div>

            <h2>Footer (English)</h2>
            {field("footerCopyrightEn", "Footer copyright (en)")}
          </section>
        </section>

        <section className="site-section" id="site-pricing">
          <h2>Pricing tiers</h2>
          {tierList.map((tier, index) => (
            <div className="site-row" key={index} data-testid={`tier-row-${index}`}>
              <Input name="tierNameJa" aria-label={`Tier ${index} name ja`} value={tier.nameJa} onChange={(event) => updateTier(index, "nameJa", event.target.value)} />
              <Input name={`tierNameEn_${index}`} aria-label={`Tier ${index} name en`} value={tier.nameEn} onChange={(event) => updateTier(index, "nameEn", event.target.value)} />
              <Input className="ui-mono" name={`tierPrice_${index}`} aria-label={`Tier ${index} price`} value={tier.price} onChange={(event) => updateTier(index, "price", event.target.value)} />
              <Input name={`tierNoteJa_${index}`} aria-label={`Tier ${index} note ja`} value={tier.noteJa} onChange={(event) => updateTier(index, "noteJa", event.target.value)} />
              <Input name={`tierNoteEn_${index}`} aria-label={`Tier ${index} note en`} value={tier.noteEn} onChange={(event) => updateTier(index, "noteEn", event.target.value)} />
              <Input className="ui-mono" name={`tierSortOrder_${index}`} aria-label={`Tier ${index} sort order`} type="number" value={tier.sortOrder} onChange={(event) => updateTier(index, "sortOrder", event.target.value)} />
              <div className="site-row-actions">
                <Button type="button" variant="secondary" size="sm" aria-label={`Move tier ${index} up`} onClick={() => setTierList((list) => move(list, index, -1))}>↑</Button>
                <Button type="button" variant="secondary" size="sm" aria-label={`Move tier ${index} down`} onClick={() => setTierList((list) => move(list, index, 1))}>↓</Button>
                <Button type="button" variant="secondary" size="sm" aria-label={`Remove tier ${index}`} onClick={() => setTierList((list) => list.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Add pricing tier"
            onClick={() =>
              setTierList((list) => [
                ...list,
                { nameJa: "", nameEn: "", price: "", noteJa: "", noteEn: "", sortOrder: String(list.length) },
              ])
            }
          >
            Add pricing tier
          </Button>
        </section>

        <section className="site-section" id="site-cases">
          <h2>Case studies</h2>
          {caseList.map((item, index) => (
            <div className="site-row" key={index} data-testid={`case-row-${index}`}>
              <div className="site-row-header">
                <Select name="caseStatus" aria-label={`Case study ${index} status`} value={item.status} onChange={(event) => updateCase(index, "status", event.target.value)}>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </Select>
                <div className="site-row-actions">
                  <Button type="button" variant="secondary" size="sm" aria-label={`Move case study ${index} up`} onClick={() => setCaseList((list) => move(list, index, -1))}>↑</Button>
                  <Button type="button" variant="secondary" size="sm" aria-label={`Move case study ${index} down`} onClick={() => setCaseList((list) => move(list, index, 1))}>↓</Button>
                  <Button type="button" variant="secondary" size="sm" aria-label={`Remove case study ${index}`} onClick={() => setCaseList((list) => list.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
                </div>
              </div>
              <Input name={`caseMetaJa_${index}`} aria-label={`Case study ${index} meta ja`} value={item.metaJa} onChange={(event) => updateCase(index, "metaJa", event.target.value)} />
              <Input name={`caseMetaEn_${index}`} aria-label={`Case study ${index} meta en`} value={item.metaEn} onChange={(event) => updateCase(index, "metaEn", event.target.value)} />
              <Input name={`caseTitleJa_${index}`} aria-label={`Case study ${index} title ja`} value={item.titleJa} onChange={(event) => updateCase(index, "titleJa", event.target.value)} />
              <Input name={`caseTitleEn_${index}`} aria-label={`Case study ${index} title en`} value={item.titleEn} onChange={(event) => updateCase(index, "titleEn", event.target.value)} />
              <Input name={`caseSummaryJa_${index}`} aria-label={`Case study ${index} summary ja`} value={item.summaryJa} onChange={(event) => updateCase(index, "summaryJa", event.target.value)} />
              <Input name={`caseSummaryEn_${index}`} aria-label={`Case study ${index} summary en`} value={item.summaryEn} onChange={(event) => updateCase(index, "summaryEn", event.target.value)} />
              <Input type="file" name={`caseImage_${index}`} accept="image/jpeg,image/png,image/webp" aria-label={`Case study ${index} image`} />
              {fieldError(state, `caseImage_${index}`)}
              <Input type="hidden" name={`caseImageUrl_${index}`} value={item.imageUrl} readOnly />
              <Input type="hidden" name={`caseImageWidth_${index}`} value={item.imageWidth} readOnly />
              <Input type="hidden" name={`caseImageHeight_${index}`} value={item.imageHeight} readOnly />
              <Input className="ui-mono" name={`caseSortOrder_${index}`} aria-label={`Case study ${index} sort order`} type="number" value={item.sortOrder} onChange={(event) => updateCase(index, "sortOrder", event.target.value)} />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Add case study"
            onClick={() =>
              setCaseList((list) => [
                ...list,
                {
                  status: "draft",
                  metaJa: "",
                  metaEn: "",
                  titleJa: "",
                  titleEn: "",
                  summaryJa: "",
                  summaryEn: "",
                  imageUrl: "",
                  imageWidth: "",
                  imageHeight: "",
                  sortOrder: String(list.length),
                },
              ])
            }
          >
            Add case study
          </Button>
        </section>

        <div className="site-form-actions">
          <Button type="submit" className="ui-form-submit" loading={pending}>
            Save site settings
          </Button>
        </div>
      </div>
    </form>
  );
}
