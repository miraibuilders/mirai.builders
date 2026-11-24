export function siteOrigin(): string {
  const value = process.env.SITE_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://mirai-lab.example";
  return value.replace(/\/+$/, "");
}
