"use server";

import { siteContent, t, type Locale } from "@/content/site";
import { notifyStaff } from "@/lib/staff-alert";
import { getDb } from "@/lib/db";
import { contactRequests } from "@mirai/db";

const locale: Locale = "ja";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitContactRequest(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const honeypot = asString(formData.get("website"));
  if (honeypot) {
    return { status: "success" };
  }

  const name = asString(formData.get("name"));
  const company = asString(formData.get("company"));
  const email = asString(formData.get("email"));
  const phone = asString(formData.get("phone"));
  const message = asString(formData.get("message"));
  const topic = asString(formData.get("topic"));
  const websiteUrl = asString(formData.get("websiteUrl"));
  const noWebsite = formData.get("noWebsite") !== null;
  const consent = formData.get("consent") !== null;

  if (!name || !company || !email || !phone || !message || !topic || !consent) {
    return { status: "error", message: t(siteContent.formErrors.required, locale) };
  }

  if (!isValidEmail(email)) {
    return { status: "error", message: t(siteContent.formErrors.email, locale) };
  }

  if (name.length > 120 || company.length > 160 || email.length > 320 || phone.length > 40 || message.length > 4000) {
    return { status: "error", message: t(siteContent.formErrors.tooLong, locale) };
  }

  const details = [
    `Topic: ${topic}`,
    websiteUrl ? `Website: ${websiteUrl}` : noWebsite ? "Website: none" : "",
    "Consent: agreed",
  ].filter(Boolean);
  const storedMessage = `${message}\n\n${details.join("\n")}`;

  try {
    await getDb().insert(contactRequests).values({
      name,
      company,
      email,
      phone,
      message: storedMessage,
    });
    return { status: "success" };
  } catch (error) {
    await notifyStaff(
      "contact_database_failure",
      { route: "/#contact", reason: "insert_failed" },
      error,
    );
    return { status: "error", message: t(siteContent.formErrors.generic, locale) };
  }
}
