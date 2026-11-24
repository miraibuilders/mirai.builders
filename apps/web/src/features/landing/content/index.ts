import type { MergedSiteContent } from "@/lib/settings";
import type { LandingContent, Locale } from "../types";
import { enContent } from "./en";
import { jaContent } from "./ja";

export function buildLandingContent(site: MergedSiteContent, locale: Locale): LandingContent {
  return locale === "ja" ? jaContent(site) : enContent(site);
}
