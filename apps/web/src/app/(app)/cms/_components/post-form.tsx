"use client";

import type { CmsPostRow } from "@/lib/cms";
import { Badge, Button, FormField, Icon, Input, SectionHeader, Textarea } from "@/ui";

export function PostForm({
  action,
  post,
}: {
  action: (formData: FormData) => Promise<void>;
  post?: CmsPostRow | null;
}) {
  return (
    <form className="cms-form ui-form-stack post-form" action={action}>
      {post ? <input type="hidden" name="postId" value={post.id} /> : null}
      <div className="post-editor-grid">
        <section className="ui-form-section">
          <SectionHeader
            title="Content"
            description="Markdown body and the public slug."
            actions={
              <Badge tone={post?.status === "published" ? "success" : "warning"}>
                {post?.status ?? "draft"}
              </Badge>
            }
          />
          <FormField label="Title" required>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="title"
                defaultValue={post?.title ?? ""}
                required
                aria-describedby={describedBy}
                aria-invalid={invalid}
                placeholder="Post title"
              />
            )}
          </FormField>
          <FormField label="Slug" required>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="slug"
                defaultValue={post?.slug ?? ""}
                required
                aria-describedby={describedBy}
                aria-invalid={invalid}
                placeholder="post-slug"
                className="ui-mono"
              />
            )}
          </FormField>
          <FormField label="Body (Markdown)" required>
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                name="bodyMd"
                defaultValue={post?.bodyMd ?? ""}
                required
                rows={12}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                placeholder="# Heading"
              />
            )}
          </FormField>
        </section>

        <div className="post-editor-side">
          <section className="ui-form-section">
            <SectionHeader title="Search" description="Metadata used in search results." />
            <FormField label="SEO title">
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="seoTitle"
                  defaultValue={post?.seoTitle ?? ""}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                />
              )}
            </FormField>
            <FormField label="SEO description">
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  name="seoDescription"
                  defaultValue={post?.seoDescription ?? ""}
                  rows={3}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                />
              )}
            </FormField>
          </section>
          <section className="ui-form-section">
            <SectionHeader title="Structured data" description="Optional FAQ JSON-LD object." />
            <FormField label="FAQ JSON-LD">
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  name="faqJsonLd"
                  defaultValue={post?.faqJsonLd ? JSON.stringify(post.faqJsonLd, null, 2) : ""}
                  rows={6}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  className="ui-mono"
                />
              )}
            </FormField>
          </section>
          <Button type="submit" className="ui-form-submit">
            <Icon name="check" />
            Save post
          </Button>
        </div>
      </div>
    </form>
  );
}
