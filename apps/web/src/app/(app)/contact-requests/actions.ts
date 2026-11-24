"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { contactRequests, leadActivities, leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { requireCrmEditor } from "@/lib/crm-auth";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function promoteContactRequest(formData: FormData): Promise<void> {
  await requireCrmEditor();
  const requestId = typeof formData.get("requestId") === "string" ? String(formData.get("requestId")) : "";
  if (!UUID_PATTERN.test(requestId)) throw new Error("CRM_INVALID_CONTACT_REQUEST");

  const leadId = await getDb().transaction(async (tx) => {
    const [request] = await tx
      .select()
      .from(contactRequests)
      .where(eq(contactRequests.id, requestId))
      .limit(1)
      .for("update");
    if (!request || request.leadId) throw new Error("CRM_CONTACT_REQUEST_ALREADY_PROMOTED");

    const [created] = await tx
      .insert(leads)
      .values({
        company: request.company,
        websiteUrl: "[WEBSITE_URL_PLACEHOLDER]",
        segment: "other",
        reachability: "cold_list",
        nextStep: "[FOLLOW_UP_PLACEHOLDER]",
        preferredTemplate: "branded",
      })
      .returning({ id: leads.id });

    await tx.insert(leadActivities).values({
      leadId: created.id,
      note: `Contact: ${request.name} / ${request.email} / ${request.phone}\n${request.message}`,
    });
    await tx
      .update(contactRequests)
      .set({ leadId: created.id })
      .where(eq(contactRequests.id, requestId));
    return created.id;
  });

  revalidatePath("/contact-requests");
  revalidatePath("/leads");
  redirect(`/leads/${leadId}`);
}
