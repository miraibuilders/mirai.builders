import { parsePhoneNumberFromString } from "libphonenumber-js";
import psl from "psl";

const KANJI_DIGITS: Record<string, string> = {
  "〇": "0",
  "零": "0",
  "一": "1",
  "二": "2",
  "三": "3",
  "四": "4",
  "五": "5",
  "六": "6",
  "七": "7",
  "八": "8",
  "九": "9",
};

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

const PLATFORM_SUFFIXES = new Set([
  "wixsite.com",
  "jimdofree.com",
  "ameblo.jp",
  "facebook.com",
  "instagram.com",
  "line.me",
]);

function kanjiRunToDigits(run: string): string {
  if (/^[〇零一二三四五六七八九]+$/.test(run)) {
    return [...run].map((char) => KANJI_DIGITS[char]).join("");
  }
  let total = 0;
  let section = 0;
  let number = 0;
  for (const char of run) {
    if (char in KANJI_DIGITS) {
      number = Number(KANJI_DIGITS[char]);
    } else if (char === "十") {
      section += (number || 1) * 10;
      number = 0;
    } else if (char === "百") {
      section += (number || 1) * 100;
      number = 0;
    } else if (char === "千") {
      section += (number || 1) * 1000;
      number = 0;
    } else if (char === "万") {
      total += (section + number || 1) * 10000;
      section = 0;
      number = 0;
    }
  }
  return String(total + section + number);
}

export function kanjiNumeralsToDigits(value: string): string {
  return value.replace(/([〇零一二三四五六七八九十百千万]+)(丁目|番|号|町|条)/g, (_match, run: string, counter: string) =>
    `${kanjiRunToDigits(run)}${counter}`,
  );
}

export function normalizeCorporateNumber(value: string): string | null {
  const digits = value.normalize("NFKC").replace(/\D/g, "");
  return /^\d{13}$/.test(digits) ? digits : null;
}

export function corporateNumberCheckDigitValid(value: string): boolean {
  const digits = normalizeCorporateNumber(value);
  if (!digits) return false;
  let sum = 0;
  for (let index = 0; index < 12; index += 1) {
    const digit = Number(digits[index]);
    sum += index % 2 === 1 ? digit * 2 : digit;
  }
  const remainder = sum % 9;
  const expected = remainder === 0 || remainder === 1 ? 0 : 9 - remainder;
  return expected === Number(digits[12]);
}

export function normalizePhone(value: string): string | null {
  const parsed = parsePhoneNumberFromString(value.normalize("NFKC").trim(), "JP");
  if (!parsed || !parsed.isValid()) return null;
  return parsed.format("E.164");
}

export function isPhoneKeyEligible(e164: string): boolean {
  const digits = e164.replace(/\D/g, "");
  return !(
    digits.startsWith("81120") ||
    digits.startsWith("81800") ||
    digits.startsWith("8150")
  );
}

export function normalizeDomain(value: string): string | null {
  const trimmed = value.normalize("NFKC").trim().toLowerCase();
  const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").split(/[/?#]/)[0];
  if (!withoutScheme) return null;
  let host: string;
  try {
    host = new URL(`http://${withoutScheme}`).hostname;
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "");
  if (!/^[a-z0-9.-]+$/.test(host)) return null;
  const parsed = psl.parse(host);
  if (parsed.error || !parsed.domain) return host;
  return parsed.domain;
}

export function isDomainKeyEligible(normalized: string): boolean {
  const parts = normalized.split(".");
  if (parts.length < 2) return false;
  return !PLATFORM_SUFFIXES.has(parts.slice(-2).join("."));
}

export function normalizeNameKey(value: string): string {
  let text = value.normalize("NFKC").trim();
  for (const token of LEGAL_TOKENS) {
    text = text.split(token).join("");
  }
  text = text.replace(/[\u30a1-\u30f6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60),
  );
  return text.replace(/[\s\u3000・.,()（）]/g, "").toLowerCase();
}

export function normalizeAddressKey(value: string): string {
  let text = value.normalize("NFKC").trim();
  text = text.replace(/[ー−–—‐‑‒]/g, "-");
  text = kanjiNumeralsToDigits(text);
  text = text.replace(/\d+番[-−]?\d*号?.*$/, "");
  return text.replace(/[-\s\u3000]+/g, "");
}
