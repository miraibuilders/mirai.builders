import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/cms";
import { withPublicFallback } from "@/lib/public-content";
import { siteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteOrigin();
  const posts = await withPublicFallback<Awaited<ReturnType<typeof listPublishedPosts>>>(
    () => listPublishedPosts(),
    [],
    { kind: "public_sitemap_fallback", route: "/sitemap.xml" },
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
