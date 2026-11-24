import type { Metadata } from "next";
import { siteContent, t, type Locale } from "@/content/site";
import { buildLandingContent } from "@/features/landing/content";
import { LandingProvider } from "@/features/landing/components/landing-provider";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { SiteHeader } from "@/features/landing/components/site-header";
import { StickyActionBar } from "@/features/landing/components/sticky-action-bar";
import { loadSiteContent } from "@/lib/settings";
import "@/features/landing/landing.css";

const locale: Locale = "ja";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description: t(siteContent.metaDescriptions.marketing, locale),
};

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const site = await loadSiteContent();
  const contentByLocale = {
    ja: buildLandingContent(site, "ja"),
    en: buildLandingContent(site, "en"),
  };

  return (
    <LandingProvider contentByLocale={contentByLocale}>
      <div className="lp-root" id="top">
        <SiteHeader />
        {children}
        <SiteFooter />
        <StickyActionBar />
      </div>
    </LandingProvider>
  );
}
