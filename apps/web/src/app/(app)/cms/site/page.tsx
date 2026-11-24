import { redirect } from "next/navigation";
import { getCrmActor } from "@/lib/crm-auth";
import { getPricingTiers, getPublishedCaseStudies, getSiteSettings } from "@/lib/settings";
import { Badge, ButtonLink, InlineBanner, PageHeader } from "@/ui";
import { SiteForm } from "./site-form";

export const dynamic = "force-dynamic";

const EXCLUDED = new Set(["id", "updatedAt", "updatedBy"]);

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export default async function CmsSitePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [actor, { notice }] = await Promise.all([getCrmActor(), searchParams]);
  if (!actor) redirect("/login?next=%2Fcms%2Fsite");
  if (actor.role === "editor") redirect("/?notice=CMS_FORBIDDEN");
  if (actor.role !== "admin") redirect("/login?next=%2Fcms%2Fsite");

  const [settings, tiers, studies] = await Promise.all([
    getSiteSettings(),
    getPricingTiers(),
    getPublishedCaseStudies(),
  ]);

  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(settings ?? {})) {
    if (!EXCLUDED.has(key)) values[key] = stringify(value);
  }

  return (
    <div className="cms-page">
      <PageHeader
        title="Site settings"
        description="Homepage copy, pricing tiers, and published case studies."
        actions={
          <>
            <Badge tone="brand" icon="shield">Admin</Badge>
            <ButtonLink href="/cms" variant="secondary">CMS</ButtonLink>
          </>
        }
      />
      {notice ? <div className="cms-notice"><InlineBanner tone="success">{notice}</InlineBanner></div> : null}
      <SiteForm
        values={values}
        tiers={tiers.map((tier) => ({
          nameJa: stringify(tier.nameJa),
          nameEn: stringify(tier.nameEn),
          price: stringify(tier.price),
          noteJa: stringify(tier.noteJa),
          noteEn: stringify(tier.noteEn),
          sortOrder: stringify(tier.sortOrder),
        }))}
        caseRows={studies.map((study) => ({
          status: stringify(study.status),
          metaJa: stringify(study.metaJa),
          metaEn: stringify(study.metaEn),
          titleJa: stringify(study.titleJa),
          titleEn: stringify(study.titleEn),
          summaryJa: stringify(study.summaryJa),
          summaryEn: stringify(study.summaryEn),
          imageUrl: stringify(study.imageUrl),
          imageWidth: stringify(study.imageWidth),
          imageHeight: stringify(study.imageHeight),
          sortOrder: stringify(study.sortOrder),
        }))}
      />
    </div>
  );
}
