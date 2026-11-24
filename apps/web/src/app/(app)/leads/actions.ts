"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { leadActivities, leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { requireCrmAdmin, requireCrmEditor } from "@/lib/crm-auth";
import { enqueueScan } from "@/lib/scans";
import {
  LEAD_SEGMENTS,
  LEAD_STAGES,
  REACHABILITY_OPTIONS,
  TEMPLATE_OPTIONS,
  type LeadStage,
} from "@/lib/lead-view";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function asDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return Number.isNaN(Date.parse(value)) ? null : value;
}

function asSize(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(5, Math.max(0, parsed)) : 0;
}

export async function createLead(formData: FormData): Promise<void> {
  await requireCrmEditor();
  const company = asString(formData.get("company"));
  const websiteUrl = asString(formData.get("websiteUrl")) || "[WEBSITE_URL_PLACEHOLDER]";
  const segment = asString(formData.get("segment"));
  const reachability = asString(formData.get("reachability"));
  const preferredTemplate = asString(formData.get("preferredTemplate")) || "branded";
  const note = asString(formData.get("note")) || "[ACTIVITY_NOTE_PLACEHOLDER]";
  const nextStep = asString(formData.get("nextStep")) || null;
  const nextStepDate = asDate(asString(formData.get("nextStepDate")));

  if (!company || !(LEAD_SEGMENTS as readonly string[]).includes(segment)) throw new Error("CRM_INVALID_LEAD");
  if (!(REACHABILITY_OPTIONS as readonly string[]).includes(reachability)) throw new Error("CRM_INVALID_LEAD");
  if (!(TEMPLATE_OPTIONS as readonly string[]).includes(preferredTemplate)) throw new Error("CRM_INVALID_LEAD");

  const [created] = await getDb()
    .insert(leads)
    .values({
      company,
      websiteUrl,
      segment: segment as (typeof LEAD_SEGMENTS)[number],
      reachability: reachability as (typeof REACHABILITY_OPTIONS)[number],
      sizeProxy: asSize(asString(formData.get("sizeProxy"))),
      preferredTemplate: preferredTemplate as (typeof TEMPLATE_OPTIONS)[number],
      nextStep,
      nextStepDate,
    })
    .returning({ id: leads.id });

  await getDb().insert(leadActivities).values({ leadId: created.id, note, nextStep, nextStepDate });
  revalidatePath("/leads");
  redirect(`/leads/${created.id}`);
}

export async function moveLeadStage(formData: FormData): Promise<void> {
  await requireCrmEditor();
  const leadId = asString(formData.get("leadId"));
  const stage = asString(formData.get("stage")) as LeadStage;
  if (!leadId || !(LEAD_STAGES as readonly string[]).includes(stage)) throw new Error("CRM_INVALID_STAGE");
  await getDb()
    .update(leads)
    .set({ stage, updatedAt: new Date() })
    .where(eq(leads.id, leadId));
  await getDb().insert(leadActivities).values({
    leadId,
    note: `[STAGE_CHANGED_PLACEHOLDER] ${stage}`,
  });
  revalidatePath("/leads");
}

function redirectWithScanResult(
  leadId: string,
  result: Awaited<ReturnType<typeof enqueueScan>>,
): never {
  const message = result.ok ? `${result.kind} queued` : result.message ?? result.error;
  redirect(`/leads/${leadId}?notice=${encodeURIComponent(message)}`);
}

export async function triggerLeadScan(formData: FormData): Promise<void> {
  await requireCrmEditor();
  const leadId = asString(formData.get("leadId"));
  const result = await enqueueScan(leadId, "scan");
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  redirectWithScanResult(leadId, result);
}

export async function triggerLeadDetailScan(formData: FormData): Promise<void> {
  await requireCrmEditor();
  const leadId = asString(formData.get("leadId"));
  const result = await enqueueScan(leadId, "detail");
  revalidatePath(`/leads/${leadId}`);
  redirectWithScanResult(leadId, result);
}

export async function deleteLead(formData: FormData): Promise<void> {
  await requireCrmAdmin();
  const leadId = asString(formData.get("leadId"));
  if (!leadId) throw new Error("CRM_INVALID_LEAD");
  await getDb().delete(leads).where(eq(leads.id, leadId));
  revalidatePath("/leads");
  redirect("/leads");
}
