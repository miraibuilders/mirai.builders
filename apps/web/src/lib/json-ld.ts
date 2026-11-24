import { siteContent, t, type Locale } from "@/content/site";

const locale: Locale = "ja";

export type PublicPostJsonLd = {
  title: string;
  slug: string;
  publishedAt: Date | null;
  seoDescription: string | null;
  authorName: string | null;
};

export function articleJsonLd(post: PublicPostJsonLd, origin: string) {
  const url = `${origin}/blog/${post.slug}`;
  const date = post.publishedAt?.toISOString() ?? null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? t(siteContent.brand.name, locale),
    datePublished: date,
    dateModified: date,
    url,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: post.authorName ?? t(siteContent.brand.name, locale),
    },
    publisher: {
      "@type": "Organization",
      name: t(siteContent.brand.name, locale),
    },
  };
}

export function faqJsonLd(value: Record<string, unknown> | null) {
  if (!value) return null;
  if (value["@type"] === "FAQPage") {
    return { "@context": "https://schema.org", ...value };
  }
  const mainEntity = value.mainEntity;
  if (!Array.isArray(mainEntity)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
