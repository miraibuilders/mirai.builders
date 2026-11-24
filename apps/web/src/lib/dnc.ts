export const DNC_KINDS = ["corporate_number", "domain", "phone", "name_key"] as const;

export type DncKind = (typeof DNC_KINDS)[number];

const LEGAL_TOKENS = [
  "特定非営利活動法人",
  "社会保険労務士法人",
  "一般社団法人",
  "公益社団法人",
  "税理士法人",
  "有限会社",
  "株式会社",
  "合同会社",
  "医療法人",
  "財団法人",
  "学校法人",
];

export function isDncKind(value: string): value is DncKind {
  return DNC_KINDS.includes(value as DncKind);
}

export function normalizeDncValue(kind: DncKind, value: string): string | null {
  const normalized = value.normalize("NFKC").trim();
  if (!normalized) return null;

  if (kind === "corporate_number") {
    const digits = normalized.replace(/\D/g, "");
    return /^\d{13}$/.test(digits) ? digits : null;
  }

  if (kind === "domain") {
    const withoutScheme = normalized.toLowerCase().replace(/^[a-z][a-z0-9+.-]*:\/\//, "").split(/[/?#]/)[0];
    const host = withoutScheme.replace(/^www\./, "");
    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) ? host : null;
  }

  if (kind === "phone") {
    const digits = normalized.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) return null;
    return digits.startsWith("0") ? `81${digits.slice(1)}` : digits;
  }

  let name = normalized;
  for (const token of LEGAL_TOKENS) name = name.split(token).join("");
  name = name.replace(/[\u30a1-\u30f6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
  const key = name.replace(/[\s\u3000・.,()（）]/g, "").toLowerCase();
  return key.length > 0 ? key : null;
}
