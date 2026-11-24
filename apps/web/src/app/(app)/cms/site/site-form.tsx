"use client";

import { useActionState, useState, type ChangeEvent } from "react";
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

  function input(name: string, options: { label?: string; textarea?: boolean; required?: boolean } = {}) {
    const common = {
      name,
      value: current[name] ?? "",
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        set(name, event.target.value),
      "aria-label": options.label,
      "aria-invalid": Boolean(state.errors[name]),
    };
    return options.textarea ? (
      <Textarea {...common} rows={3} />
    ) : (
      <Input {...common} type={name === "offerPrice" ? "number" : "text"} />
    );
  }

  function move<T>(list: T[], index: number, offset: number): T[] {
    const next = [...list];
    const target = index + offset;
    if (target < 0 || target >= next.length) return next;
    [next[index], next[target]] = [next[target]!, next[index]!];
    return next;
  }

  return (
    <form className="cms-form site-form" action={formAction}>
      {state.status === "error" ? (
        <div data-testid="form-error">
          <InlineBanner tone="danger">{state.message}</InlineBanner>
        </div>
      ) : null}
      <ErrorSummary errors={errorLinks} />

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
        <label className="field">
          Phone (required)
          {input("phone", { label: "Phone", required: true })}
          {fieldError(state, "phone")}
        </label>
        <label className="field">
          Email
          {input("emailJa", { label: "Email (ja)" })}
        </label>
        <label className="field">
          Address
          {input("addressJa", { label: "Address (ja)" })}
        </label>

        <h2>Hero (日本語)</h2>
        <label className="field">
          Headline (required)
          {input("heroHeadlineJa", { label: "Hero headline (ja)", required: true })}
          {fieldError(state, "heroHeadlineJa")}
        </label>
        <label className="field">
          Subheadline
          {input("heroSubheadlineJa", { label: "Hero subheadline (ja)", textarea: true })}
        </label>
        <label className="field">
          CTA
          {input("heroCtaJa", { label: "Hero CTA (ja)" })}
        </label>
        <label className="field">
          Hero image
          <Input type="file" name="heroImage" accept="image/jpeg,image/png,image/webp" aria-label="Hero image" />
          {fieldError(state, "heroImage")}
          <Input type="hidden" name="heroImageUrl" value={current.heroImageUrl ?? ""} readOnly />
          <Input type="hidden" name="heroImageWidth" value={current.heroImageWidth ?? ""} readOnly />
          <Input type="hidden" name="heroImageHeight" value={current.heroImageHeight ?? ""} readOnly />
        </label>
        <label className="field">
          Hero image alt
          {input("heroImageAltJa", { label: "Hero image alt (ja)" })}
        </label>

        <h2>Offer (日本語)</h2>
        <label className="field">
          Name (required)
          {input("offerNameJa", { label: "Offer name (ja)", required: true })}
          {fieldError(state, "offerNameJa")}
        </label>
        <label className="field">
          Description
          {input("offerDescriptionJa", { label: "Offer description (ja)", textarea: true })}
        </label>
        <label className="field">
          Price (required)
          {input("offerPrice", { label: "Offer price", required: true })}
          {fieldError(state, "offerPrice")}
        </label>

        <h2>About author (日本語)</h2>
        <label className="field">
          Name
          {input("aboutAuthorNameJa", { label: "Author name (ja)" })}
        </label>
        <label className="field">
          Bio
          {input("aboutAuthorBioJa", { label: "Author bio (ja)", textarea: true })}
        </label>
        <label className="field">
          Author image
          <Input type="file" name="authorImage" accept="image/jpeg,image/png,image/webp" aria-label="Author image" />
          {fieldError(state, "authorImage")}
          <Input type="hidden" name="aboutAuthorImageUrl" value={current.aboutAuthorImageUrl ?? ""} readOnly />
          <Input type="hidden" name="aboutAuthorImageWidth" value={current.aboutAuthorImageWidth ?? ""} readOnly />
          <Input type="hidden" name="aboutAuthorImageHeight" value={current.aboutAuthorImageHeight ?? ""} readOnly />
        </label>

        <h2>Footer (日本語)</h2>
        <label className="field">
          Copyright
          {input("footerCopyrightJa", { label: "Footer copyright (ja)" })}
        </label>
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
        <label className="field">
          Email
          {input("emailEn", { label: "Email (en)" })}
        </label>
        <label className="field">
          Address
          {input("addressEn", { label: "Address (en)" })}
        </label>

        <h2>Hero (English)</h2>
        <label className="field">
          Headline
          {input("heroHeadlineEn", { label: "Hero headline (en)" })}
        </label>
        <label className="field">
          Subheadline
          {input("heroSubheadlineEn", { label: "Hero subheadline (en)", textarea: true })}
        </label>
        <label className="field">
          CTA
          {input("heroCtaEn", { label: "Hero CTA (en)" })}
        </label>

        <h2>Offer (English)</h2>
        <label className="field">
          Name
          {input("offerNameEn", { label: "Offer name (en)" })}
        </label>
        <label className="field">
          Description
          {input("offerDescriptionEn", { label: "Offer description (en)", textarea: true })}
        </label>

        <h2>About author (English)</h2>
        <label className="field">
          Name
          {input("aboutAuthorNameEn", { label: "Author name (en)" })}
        </label>
        <label className="field">
          Bio
          {input("aboutAuthorBioEn", { label: "Author bio (en)", textarea: true })}
        </label>

        <h2>Footer (English)</h2>
        <label className="field">
          Copyright
          {input("footerCopyrightEn", { label: "Footer copyright (en)" })}
        </label>
      </section>

      <section className="site-section">
        <h2>Pricing tiers</h2>
        {tierList.map((tier, index) => (
          <div className="site-row" key={index} data-testid={`tier-row-${index}`}>
            <Input name="tierNameJa" aria-label={`Tier ${index} name ja`} value={tier.nameJa} onChange={(e) => setTierList((list) => list.map((item, i) => (i === index ? { ...item, nameJa: e.target.value } : item)))} />
            <Input name={`tierNameEn_${index}`} aria-label={`Tier ${index} name en`} value={tier.nameEn} onChange={(e) => setTierList((list) => list.map((item, i) => (i === index ? { ...item, nameEn: e.target.value } : item)))} />
            <Input name={`tierPrice_${index}`} aria-label={`Tier ${index} price`} value={tier.price} onChange={(e) => setTierList((list) => list.map((item, i) => (i === index ? { ...item, price: e.target.value } : item)))} />
            <Input name={`tierNoteJa_${index}`} aria-label={`Tier ${index} note ja`} value={tier.noteJa} onChange={(e) => setTierList((list) => list.map((item, i) => (i === index ? { ...item, noteJa: e.target.value } : item)))} />
            <Input name={`tierNoteEn_${index}`} aria-label={`Tier ${index} note en`} value={tier.noteEn} onChange={(e) => setTierList((list) => list.map((item, i) => (i === index ? { ...item, noteEn: e.target.value } : item)))} />
            <Input name={`tierSortOrder_${index}`} aria-label={`Tier ${index} sort order`} type="number" value={tier.sortOrder} onChange={(e) => setTierList((list) => list.map((item, i) => (i === index ? { ...item, sortOrder: e.target.value } : item)))} />
            <Button type="button" variant="secondary" size="sm" aria-label={`Move tier ${index} up`} onClick={() => setTierList((list) => move(list, index, -1))}>↑</Button>
            <Button type="button" variant="secondary" size="sm" aria-label={`Move tier ${index} down`} onClick={() => setTierList((list) => move(list, index, 1))}>↓</Button>
            <Button type="button" variant="secondary" size="sm" aria-label={`Remove tier ${index}`} onClick={() => setTierList((list) => list.filter((_, i) => i !== index))}>Remove</Button>
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

      <section className="site-section">
        <h2>Case studies</h2>
        {caseList.map((item, index) => (
          <div className="site-row" key={index} data-testid={`case-row-${index}`}>
            <Select name="caseStatus" aria-label={`Case study ${index} status`} value={item.status} onChange={(e) => setCaseList((list) => list.map((entry, i) => (i === index ? { ...entry, status: e.target.value } : entry)))}>
              <option value="draft">draft</option>
              <option value="published">published</option>
            </Select>
            <Input name={`caseMetaJa_${index}`} aria-label={`Case study ${index} meta ja`} value={item.metaJa} onChange={(e) => setCaseList((list) => list.map((entry, i) => (i === index ? { ...entry, metaJa: e.target.value } : entry)))} />
            <Input name={`caseMetaEn_${index}`} aria-label={`Case study ${index} meta en`} value={item.metaEn} onChange={(e) => setCaseList((list) => list.map((entry, i) => (i === index ? { ...entry, metaEn: e.target.value } : entry)))} />
            <Input name={`caseTitleJa_${index}`} aria-label={`Case study ${index} title ja`} value={item.titleJa} onChange={(e) => setCaseList((list) => list.map((entry, i) => (i === index ? { ...entry, titleJa: e.target.value } : entry)))} />
            <Input name={`caseTitleEn_${index}`} aria-label={`Case study ${index} title en`} value={item.titleEn} onChange={(e) => setCaseList((list) => list.map((entry, i) => (i === index ? { ...entry, titleEn: e.target.value } : entry)))} />
            <Input name={`caseSummaryJa_${index}`} aria-label={`Case study ${index} summary ja`} value={item.summaryJa} onChange={(e) => setCaseList((list) => list.map((entry, i) => (i === index ? { ...entry, summaryJa: e.target.value } : entry)))} />
            <Input name={`caseSummaryEn_${index}`} aria-label={`Case study ${index} summary en`} value={item.summaryEn} onChange={(e) => setCaseList((list) => list.map((entry, i) => (i === index ? { ...entry, summaryEn: e.target.value } : entry)))} />
            <Input type="file" name={`caseImage_${index}`} accept="image/jpeg,image/png,image/webp" aria-label={`Case study ${index} image`} />
            {fieldError(state, `caseImage_${index}`)}
            <Input type="hidden" name={`caseImageUrl_${index}`} value={item.imageUrl} readOnly />
            <Input type="hidden" name={`caseImageWidth_${index}`} value={item.imageWidth} readOnly />
            <Input type="hidden" name={`caseImageHeight_${index}`} value={item.imageHeight} readOnly />
            <Input name={`caseSortOrder_${index}`} aria-label={`Case study ${index} sort order`} type="number" value={item.sortOrder} onChange={(e) => setCaseList((list) => list.map((entry, i) => (i === index ? { ...entry, sortOrder: e.target.value } : entry)))} />
            <Button type="button" variant="secondary" size="sm" aria-label={`Move case study ${index} up`} onClick={() => setCaseList((list) => move(list, index, -1))}>↑</Button>
            <Button type="button" variant="secondary" size="sm" aria-label={`Move case study ${index} down`} onClick={() => setCaseList((list) => move(list, index, 1))}>↓</Button>
            <Button type="button" variant="secondary" size="sm" aria-label={`Remove case study ${index}`} onClick={() => setCaseList((list) => list.filter((_, i) => i !== index))}>Remove</Button>
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

      <Button type="submit" className="ui-form-submit" loading={pending}>
        Save site settings
      </Button>
    </form>
  );
}
