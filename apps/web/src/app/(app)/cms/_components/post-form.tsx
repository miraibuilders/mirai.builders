"use client";

import type { CmsPostRow } from "@/lib/cms";
import { Button, FormField, Input, Textarea } from "@/ui";

export function PostForm({
  action,
  post,
}: {
  action: (formData: FormData) => Promise<void>;
  post?: CmsPostRow | null;
}) {
  return (
    <form className="cms-form ui-form-stack" action={action}>
      {post ? <input type="hidden" name="postId" value={post.id} /> : null}
      <FormField label="Title" required>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="title" defaultValue={post?.title ?? ""} required aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="Slug" required>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="slug" defaultValue={post?.slug ?? ""} required aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="Body (Markdown)" required>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} name="bodyMd" defaultValue={post?.bodyMd ?? ""} required rows={12} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="SEO title">
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="seoTitle" defaultValue={post?.seoTitle ?? ""} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="SEO description">
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} name="seoDescription" defaultValue={post?.seoDescription ?? ""} rows={3} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FormField>
      <FormField label="FAQ JSON-LD">
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="faqJsonLd"
            defaultValue={post?.faqJsonLd ? JSON.stringify(post.faqJsonLd, null, 2) : ""}
            rows={6}
            aria-describedby={describedBy}
            aria-invalid={invalid}
          />
        )}
      </FormField>
      <Button type="submit" className="ui-form-submit">Save post</Button>
    </form>
  );
}
