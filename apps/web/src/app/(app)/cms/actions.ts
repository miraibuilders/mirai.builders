"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authors, posts } from "@mirai/db";
import { getDb } from "@/lib/db";
import {
  canDeleteCmsPost,
  canEditCmsPost,
  canManageCmsAuthors,
  canPublishCmsPost,
  requireCmsEditor,
} from "@/lib/cms-auth";
import { getCrmActor } from "@/lib/crm-auth";
import { getCmsPost, parseFaqJsonLd, slugify } from "@/lib/cms";
import { pingIndexNow } from "@/lib/indexnow";
import { saveMediaUpload } from "@/lib/media";
import { siteOrigin } from "@/lib/site";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function cmsRedirect(path: string, message: string): never {
  revalidatePath("/cms");
  revalidatePath("/blog");
  redirect(`${path}${path.includes("?") ? "&" : "?"}notice=${encodeURIComponent(message)}`);
}

export async function createPost(formData: FormData): Promise<void> {
  const actor = await requireCmsEditor();
  const title = asString(formData.get("title"));
  const bodyMd = asString(formData.get("bodyMd"));
  const slug = asString(formData.get("slug")) || slugify(title);
  if (!title || !bodyMd || !slug) cmsRedirect("/cms/posts/new", "Title, body and slug are required");

  const [created] = await getDb()
    .insert(posts)
    .values({
      title,
      slug,
      bodyMd,
      authorId: actor.userId,
      status: "draft",
      seoTitle: asString(formData.get("seoTitle")) || null,
      seoDescription: asString(formData.get("seoDescription")) || null,
      faqJsonLd: parseFaqJsonLd(asString(formData.get("faqJsonLd"))),
    })
    .returning({ id: posts.id });
  cmsRedirect(`/cms/posts/${created.id}/edit`, "Draft created");
}

export async function updatePost(formData: FormData): Promise<void> {
  const actor = await requireCmsEditor();
  const postId = asString(formData.get("postId"));
  const post = await getCmsPost(postId);
  if (!post) cmsRedirect("/cms", "Post not found");
  if (!canEditCmsPost(actor.role, post.authorId, actor.userId)) cmsRedirect("/cms", "Forbidden");

  const title = asString(formData.get("title"));
  const bodyMd = asString(formData.get("bodyMd"));
  const slug = asString(formData.get("slug")) || slugify(title);
  if (!title || !bodyMd || !slug) cmsRedirect(`/cms/posts/${postId}/edit`, "Title, body and slug are required");

  await getDb()
    .update(posts)
    .set({
      title,
      slug,
      bodyMd,
      seoTitle: asString(formData.get("seoTitle")) || null,
      seoDescription: asString(formData.get("seoDescription")) || null,
      faqJsonLd: parseFaqJsonLd(asString(formData.get("faqJsonLd"))),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
  cmsRedirect(`/cms/posts/${postId}/edit`, "Draft updated");
}

export async function publishPost(formData: FormData): Promise<void> {
  const actor = await getCrmActor();
  if (!actor || !canPublishCmsPost(actor.role)) cmsRedirect("/cms", "Forbidden");
  const postId = asString(formData.get("postId"));
  const post = await getCmsPost(postId);
  await getDb()
    .update(posts)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(posts.id, postId));
  if (post) {
    await pingIndexNow([`${siteOrigin()}/blog/${post.slug}`]);
    revalidatePath(`/blog/${post.slug}`);
  }
  cmsRedirect("/cms", "Post published");
}

export async function deletePost(formData: FormData): Promise<void> {
  const actor = await getCrmActor();
  if (!actor || !canDeleteCmsPost(actor.role)) cmsRedirect("/cms", "Forbidden");
  const postId = asString(formData.get("postId"));
  await getDb().delete(posts).where(eq(posts.id, postId));
  cmsRedirect("/cms", "Post deleted");
}

export async function createAuthor(formData: FormData): Promise<void> {
  const actor = await getCrmActor();
  if (!actor || !canManageCmsAuthors(actor.role)) cmsRedirect("/cms/authors", "Forbidden");
  const name = asString(formData.get("name"));
  if (!name) cmsRedirect("/cms/authors", "Name is required");
  await getDb()
    .insert(authors)
    .values({
      name,
      bio: asString(formData.get("bio")) || null,
      photoUrl: asString(formData.get("photoUrl")) || null,
      userId: asString(formData.get("userId")) || null,
    });
  cmsRedirect("/cms/authors", "Author created");
}

export async function uploadMedia(formData: FormData): Promise<void> {
  const actor = await requireCmsEditor();
  const file = formData.get("file");
  if (!(file instanceof File)) cmsRedirect("/cms/media", "A file is required");
  const result = await saveMediaUpload(file, actor.userId);
  cmsRedirect("/cms/media", result.ok ? "Media uploaded" : `[CMS_ERROR_${result.error}]`);
}
