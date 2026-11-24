"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { doNotContact, getDb } from "@mirai/db";
import { requireCrmAdmin } from "@/lib/crm-auth";
import { isDncKind, normalizeDncValue } from "@/lib/dnc";

export async function addDncEntry(formData: FormData): Promise<void> {
  const actor = await requireCrmAdmin();
  const kind = String(formData.get("kind") ?? "");
  const value = String(formData.get("value") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!isDncKind(kind) || !reason) redirect("/settings/dnc?notice=Invalid%20DNC%20entry");
  const valueNorm = normalizeDncValue(kind, value);
  if (!valueNorm) redirect("/settings/dnc?notice=Invalid%20DNC%20value");

  await getDb()
    .insert(doNotContact)
    .values({ kind, valueNorm, reason, origin: "manual", addedBy: actor.userId })
    .onConflictDoNothing();

  revalidatePath("/settings/dnc");
  redirect("/settings/dnc?notice=DNC%20entry%20saved");
}

export async function removeDncEntry(formData: FormData): Promise<void> {
  await requireCrmAdmin();
  const kind = String(formData.get("kind") ?? "");
  const valueNorm = String(formData.get("valueNorm") ?? "");
  if (!isDncKind(kind) || !valueNorm) redirect("/settings/dnc?notice=Invalid%20DNC%20entry");

  await getDb().delete(doNotContact).where(and(eq(doNotContact.kind, kind), eq(doNotContact.valueNorm, valueNorm)));
  revalidatePath("/settings/dnc");
  redirect("/settings/dnc?notice=DNC%20entry%20removed");
}
