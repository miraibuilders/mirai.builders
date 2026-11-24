import { asc, eq } from "drizzle-orm";
import { caseStudies, getDb, pricingTiers, siteSettings } from "@mirai/db";
import { siteContent } from "@/content/site";
import { withPublicFallback } from "./public-content";

type LocalizedText = { ja: string; en: string };
type ImageSize = { src: string; width: number; height: number };

export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type PricingTierRow = typeof pricingTiers.$inferSelect;
export type CaseStudyRow = typeof caseStudies.$inferSelect;

type MergedCaseStudy = {
  meta: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  image?: ImageSize | null;
};

export type MergedSiteContent = Omit<typeof siteContent, "hero" | "about" | "caseStudies"> & {
  hero: typeof siteContent.hero & { image?: ImageSize & { alt: LocalizedText } };
  about: typeof siteContent.about & {
    authorBio?: LocalizedText;
    authorImage?: ImageSize | null;
  };
  caseStudies: MergedCaseStudy[];
};

const DEFAULT_HERO_IMAGE: ImageSize = {
  src: "/mika-placeholder.svg",
  width: 960,
  height: 1200,
};

function filled(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value.trim() === "") return null;
  return value;
}

function pick(value: string | null | undefined, fallback: string): string {
  return filled(value) ?? fallback;
}

function localizedPair(
  ja: string | null | undefined,
  en: string | null | undefined,
  fallback: LocalizedText,
): LocalizedText {
  return { ja: pick(ja, fallback.ja), en: pick(en, fallback.en) };
}

function imageFrom(
  url: string | null | undefined,
  width: number | null | undefined,
  height: number | null | undefined,
): ImageSize | null {
  if (!filled(url) || !width || !height) return null;
  return { src: String(url), width, height };
}

export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  const [row] = await getDb().select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return row ?? null;
}

export async function getPricingTiers(): Promise<PricingTierRow[]> {
  return await getDb().select().from(pricingTiers).orderBy(asc(pricingTiers.sortOrder), asc(pricingTiers.id));
}

export async function getPublishedCaseStudies(): Promise<CaseStudyRow[]> {
  return await getDb()
    .select()
    .from(caseStudies)
    .where(eq(caseStudies.status, "published"))
    .orderBy(asc(caseStudies.sortOrder), asc(caseStudies.id));
}

export function mergeSiteContent(
  settings: SiteSettingsRow | null,
  tiers: PricingTierRow[],
  publishedCaseStudies: CaseStudyRow[],
): MergedSiteContent {
  if (!settings) return siteContent as MergedSiteContent;

  const defaults = siteContent;
  const heroImage = imageFrom(settings.heroImageUrl, settings.heroImageWidth, settings.heroImageHeight);
  const authorImage = imageFrom(
    settings.aboutAuthorImageUrl,
    settings.aboutAuthorImageWidth,
    settings.aboutAuthorImageHeight,
  );

  const pricing =
    tiers.length === 0
      ? defaults.pricing
      : tiers.map((tier, index) => {
          const fallback = defaults.pricing[index];
          return {
            name: {
              ja: pick(tier.nameJa, fallback?.name.ja ?? ""),
              en: pick(tier.nameEn, fallback?.name.en ?? ""),
            },
            price: pick(tier.price, fallback?.price ?? ""),
            note: {
              ja: pick(tier.noteJa, fallback?.note.ja ?? ""),
              en: pick(tier.noteEn, fallback?.note.en ?? ""),
            },
          };
        });

  const caseStudyList: MergedCaseStudy[] =
    publishedCaseStudies.length === 0
      ? defaults.caseStudies.map((item) => ({ ...item, image: null }))
      : publishedCaseStudies.map((item, index) => {
          const fallback = defaults.caseStudies[index];
          return {
            meta: {
              ja: pick(item.metaJa, fallback?.meta.ja ?? ""),
              en: pick(item.metaEn, fallback?.meta.en ?? ""),
            },
            title: {
              ja: pick(item.titleJa, fallback?.title.ja ?? ""),
              en: pick(item.titleEn, fallback?.title.en ?? ""),
            },
            summary: {
              ja: pick(item.summaryJa, fallback?.summary.ja ?? ""),
              en: pick(item.summaryEn, fallback?.summary.en ?? ""),
            },
            image: imageFrom(item.imageUrl, item.imageWidth, item.imageHeight),
          };
        });

  return {
    ...defaults,
    contact: {
      ...defaults.contact,
      phone: pick(settings.phone, defaults.contact.phone),
      email: localizedPair(settings.emailJa, settings.emailEn, defaults.contact.email),
      address: localizedPair(settings.addressJa, settings.addressEn, defaults.contact.address),
    },
    hero: {
      ...defaults.hero,
      headline: localizedPair(settings.heroHeadlineJa, settings.heroHeadlineEn, defaults.hero.headline),
      subheadline: localizedPair(
        settings.heroSubheadlineJa,
        settings.heroSubheadlineEn,
        defaults.hero.subheadline,
      ),
      cta: localizedPair(settings.heroCtaJa, settings.heroCtaEn, defaults.hero.cta),
      image: {
        ...(heroImage ?? DEFAULT_HERO_IMAGE),
        alt: localizedPair(settings.heroImageAltJa, null, defaults.photoAlt),
      },
    },
    offer: {
      ...defaults.offer,
      name: localizedPair(settings.offerNameJa, settings.offerNameEn, defaults.offer.name),
      description: localizedPair(
        settings.offerDescriptionJa,
        settings.offerDescriptionEn,
        defaults.offer.description,
      ),
      price: settings.offerPrice ?? defaults.offer.price,
    },
    pricing,
    caseStudies: caseStudyList,
    about: {
      ...defaults.about,
      authorName: localizedPair(settings.aboutAuthorNameJa, settings.aboutAuthorNameEn, defaults.about.authorName),
      authorBio: localizedPair(settings.aboutAuthorBioJa, settings.aboutAuthorBioEn, { ja: "", en: "" }),
      authorImage,
    },
    footer: {
      ...defaults.footer,
      copyright: localizedPair(settings.footerCopyrightJa, settings.footerCopyrightEn, defaults.footer.copyright),
    },
  } as MergedSiteContent;
}

export async function loadSiteContent(): Promise<MergedSiteContent> {
  const [settings, tiers, published] = await Promise.all([
    getSiteSettings(),
    getPricingTiers(),
    getPublishedCaseStudies(),
  ]);
  return mergeSiteContent(settings, tiers, published);
}

export async function loadPublicSiteContent(): Promise<MergedSiteContent> {
  return await withPublicFallback(loadSiteContent, siteContent as MergedSiteContent, {
    kind: "public_content_fallback",
    route: "public",
    reason: "database_unavailable",
  });
}
