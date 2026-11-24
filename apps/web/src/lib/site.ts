export function siteOrigin(): string {
  const vercelUrl = process.env.VERCEL_URL;
  const fallback = vercelUrl
    ? vercelUrl.startsWith("http")
      ? vercelUrl
      : `https://${vercelUrl}`
    : "https://mirai-lab.example";
  const value = process.env.SITE_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? fallback;
  return value.replace(/\/+$/, "");
}
