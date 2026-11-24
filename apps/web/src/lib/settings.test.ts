import assert from "node:assert/strict";
import test from "node:test";
import { siteContent } from "@/content/site";
import {
  mergeSiteContent,
  type CaseStudyRow,
  type PricingTierRow,
  type SiteSettingsRow,
} from "./settings";

function row(values: Partial<SiteSettingsRow>): SiteSettingsRow {
  return { id: 1, ...values } as SiteSettingsRow;
}

test("mergeSiteContent(null, [], []) returns siteContent unchanged", () => {
  assert.deepStrictEqual(mergeSiteContent(null, [], []), siteContent);
});

test("mergeSiteContent with a partial settings row falls back per-field", () => {
  const merged = mergeSiteContent(
    row({
      phone: "03-1234-5678",
      heroHeadlineJa: "<script>alert(1)</script>",
      heroHeadlineEn: null,
      offerPrice: 41000,
      footerCopyrightJa: "",
      aboutAuthorBioJa: "著者プロフィール",
    }),
    [],
    [],
  );

  assert.equal(merged.contact.phone, "03-1234-5678");
  assert.equal(merged.hero.headline.ja, "<script>alert(1)</script>");
  assert.equal(merged.hero.headline.en, siteContent.hero.headline.en);
  assert.equal(merged.offer.price, 41000);
  assert.equal(merged.footer.copyright.ja, siteContent.footer.copyright.ja);
  assert.deepEqual(merged.about.authorBio, { ja: "著者プロフィール", en: "" });
  assert.equal(merged.hero.image?.src, "/mika-placeholder.svg");
  assert.equal(merged.about.authorImage, null);
});

test("mergeSiteContent with empty tiers falls back to siteContent.pricing", () => {
  const merged = mergeSiteContent(row({}), [], []);
  assert.deepEqual(merged.pricing, siteContent.pricing);
});

test("mergeSiteContent with a published case study replaces the default list", () => {
  const published = {
    id: "11111111-1111-4111-8111-111111111111",
    status: "published",
    metaJa: "並び替え試験",
    metaEn: "Sort trial",
    titleJa: "新しい実績",
    titleEn: "New case study",
    summaryJa: "概要",
    summaryEn: "Summary",
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    sortOrder: 1,
    createdAt: new Date(),
  } as CaseStudyRow;

  const merged = mergeSiteContent(row({}), [] as PricingTierRow[], [published]);
  assert.equal(merged.caseStudies.length, 1);
  assert.equal(merged.caseStudies[0]?.title.ja, "新しい実績");
  assert.equal(merged.caseStudies[0]?.title.en, "New case study");
  assert.equal(merged.caseStudies[0]?.image, null);
});
