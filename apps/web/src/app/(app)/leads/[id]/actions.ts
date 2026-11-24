"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { leadActivities, leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { requireCrmEditor } from "@/lib/crm-auth";
import { REACHABILITY_OPTIONS, TEMPLATE_OPTIONS, LEAD_SEGMENTS } from "@/lib/lead-view";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function asDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return Number.isNaN(Date.parse(value)) ? null : value;
}

export async function addActivity(formData: FormData): Promise<void> {
  await requireCrmEditor();
  const leadId = asString(formData.get("leadId"));
  const note = asString(formData.get("note"));
  const nextStep = asString(formData.get("nextStep")) || null;
  const nextStepDate = asDate(asString(formData.get("nextStepDate")));
  if (!leadId || !note) throw new Error("CRM_INVALID_ACTIVITY");

  await getDb().insert(leadActivities).values({ leadId, note, nextStep, nextStepDate });
  if (nextStep || nextStepDate) {
    await getDb()
      .update(leads)
      .set({ nextStep, nextStepDate, updatedAt: new Date() })
      .where(eq(leads.id, leadId));
  }
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function updateLead(formData: FormData): Promise<void> {
  await requireCrmEditor();
  const id = asString(formData.get("id"));
  const company = asString(formData.get("company"));
  const segment = asString(formData.get("segment"));
  const reachability = asString(formData.get("reachability"));
  const preferredTemplate = asString(formData.get("preferredTemplate")) || "branded";
  if (
    !id ||
    !company ||
    !(LEAD_SEGMENTS as readonly string[]).includes(segment) ||
    !(REACHABILITY_OPTIONS as readonly string[]).includes(reachability) ||
    !(TEMPLATE_OPTIONS as readonly string[]).includes(preferredTemplate)
  ) {
    throw new Error("CRM_INVALID_LEAD");
  }

  await getDb()
    .update(leads)
    .set({
      company,
      websiteUrl: asString(formData.get("websiteUrl")) || "[WEBSITE_URL_PLACEHOLDER]",
      segment: segment as (typeof LEAD_SEGMENTS)[number],
      reachability: reachability as (typeof REACHABILITY_OPTIONS)[number],
      sizeProxy: Math.min(5, Math.max(0, Number.parseInt(asString(formData.get("sizeProxy")), 10) || 0)),
      nextStep: asString(formData.get("nextStep")) || null,
      nextStepDate: asDate(asString(formData.get("nextStepDate"))),
      preferredTemplate: preferredTemplate as (typeof TEMPLATE_OPTIONS)[number],
      updatedAt: new Date(),
    })
    .where(eq(leads.id, id));
  revalidatePath("/leads");
  redirect(`/leads/${id}`);
}
