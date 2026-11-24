import { and, desc, eq, isNotNull } from "drizzle-orm";
import { authors, media, posts, users } from "@mirai/db";
import { getDb } from "@/lib/db";

export type CmsPostRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  bodyMd: string;
  authorId: string | null;
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  faqJsonLd: Record<string, unknown> | null;
  authorName: string | null;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function parseFaqJsonLd(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function listCmsPosts(): Promise<CmsPostRow[]> {
  return getDb()
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      bodyMd: posts.bodyMd,
      authorId: posts.authorId,
      publishedAt: posts.publishedAt,
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      faqJsonLd: posts.faqJsonLd,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt));
}

export async function getCmsPost(id: string): Promise<CmsPostRow | null> {
  const [row] = await getDb()
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      bodyMd: posts.bodyMd,
      authorId: posts.authorId,
      publishedAt: posts.publishedAt,
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      faqJsonLd: posts.faqJsonLd,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .limit(1);
  return row ?? null;
}

export type PublicPostRow = {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  faqJsonLd: Record<string, unknown> | null;
  authorName: string | null;
};

const publicPostColumns = {
  id: posts.id,
  title: posts.title,
  slug: posts.slug,
  bodyMd: posts.bodyMd,
  publishedAt: posts.publishedAt,
  seoTitle: posts.seoTitle,
  seoDescription: posts.seoDescription,
  faqJsonLd: posts.faqJsonLd,
  authorName: users.name,
};

const publishedOnly = and(eq(posts.status, "published"), isNotNull(posts.publishedAt));

export async function listPublishedPosts(): Promise<PublicPostRow[]> {
  return getDb()
    .select(publicPostColumns)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(publishedOnly)
    .orderBy(desc(posts.publishedAt));
}

export async function getPublishedPostBySlug(slug: string): Promise<PublicPostRow | null> {
  const [row] = await getDb()
    .select(publicPostColumns)
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(publishedOnly, eq(posts.slug, slug)))
    .limit(1);
  return row ?? null;
}

export async function listCmsAuthors() {
  return getDb()
    .select({
      id: authors.id,
      name: authors.name,
      bio: authors.bio,
      photoUrl: authors.photoUrl,
      userId: authors.userId,
      userName: users.name,
    })
    .from(authors)
    .leftJoin(users, eq(authors.userId, users.id))
    .orderBy(desc(authors.createdAt));
}

export async function listCmsMedia() {
  return getDb().select().from(media).orderBy(desc(media.createdAt));
}
