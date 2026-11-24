import type { Metadata } from "next";
import { siteContent, t, type Locale } from "@/content/site";
import { LandingSections } from "@/features/landing/components/landing-sections";
import { loadSiteContent } from "@/lib/settings";
import { siteOrigin } from "@/lib/site";

const locale: Locale = "ja";

export const metadata: Metadata = {
  title: `${t(siteContent.brand.name, locale)} | ${t(siteContent.brand.tagline, locale)}`,
  description: t(siteContent.metaDescriptions.marketing, locale),
};

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function MarketingPage() {
  const content = await loadSiteContent();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t(content.brand.name, locale),
    url: `${siteOrigin()}/`,
    telephone: content.contact.phone,
    email: siteContent.contact.structuredDataEmail,
    sameAs: ["https://x.com/mirailab_jp"],
    description: t(content.brand.description, locale),
    foundingDate: t(content.year, locale),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t(content.offer.name, locale),
    provider: {
      "@type": "Organization",
      name: t(content.brand.name, locale),
      telephone: content.contact.phone,
    },
    areaServed: "JP",
    offers: {
      "@type": "Offer",
      price: String(content.offer.price),
      priceCurrency: "JPY",
      name: t(content.offer.name, locale),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      <LandingSections />
    </>
  );
}
