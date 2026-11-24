import type { ContactErrorCode } from "./types";

export interface ContactInput {
  company: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  websiteUrl: string;
  noWebsite: boolean;
  message: string;
  consent: boolean;
  honeypot: string;
}

export type ContactErrors = Partial<
  Record<"company" | "name" | "email" | "phone" | "topic" | "websiteUrl" | "message" | "consent", ContactErrorCode>
>;

type ValidateResult = { ok: true } | { ok: false; reason: "spam" } | { ok: false; errors: ContactErrors };

function normalize(value: string): string {
  return value.normalize("NFKC").trim();
}

function normalizeWebsiteUrl(value: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

function isValidWebsiteUrl(value: string): boolean {
  try {
    const url = new URL(normalizeWebsiteUrl(value));
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function validateContact(input: ContactInput, topics: string[]): ValidateResult {
  const company = normalize(input.company);
  const name = normalize(input.name);
  const email = normalize(input.email);
  const phone = normalize(input.phone);
  const topic = normalize(input.topic);
  const websiteUrl = normalize(input.websiteUrl);
  const message = normalize(input.message);

  if (normalize(input.honeypot) !== "") {
    return { ok: false, reason: "spam" };
  }

  const errors: ContactErrors = {};

  if (!company) {
    errors.company = "required";
  }
  if (!name) {
    errors.name = "required";
  }
  if (!email) {
    errors.email = "required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "invalidEmail";
  }
  if (!phone) {
    errors.phone = "required";
  } else if (!/^\d{10,11}$/.test(phone.replace(/[\s().\-–—]/g, ""))) {
    errors.phone = "invalidPhone";
  }
  if (!topic) {
    errors.topic = "required";
  } else if (!topics.some((item) => normalize(item) === topic)) {
    errors.topic = "invalidTopic";
  }
  if (!input.noWebsite && websiteUrl && !isValidWebsiteUrl(websiteUrl)) {
    errors.websiteUrl = "invalidUrl";
  }
  if (message.length > 1000) {
    errors.message = "tooLong";
  }
  if (!input.consent) {
    errors.consent = "required";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true };
}
