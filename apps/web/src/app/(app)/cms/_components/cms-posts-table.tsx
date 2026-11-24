"use client";

import Link from "next/link";
import { DataTable, SubmitButton, type DataTableColumn } from "@/ui";
import type { CmsPostRow } from "@/lib/cms";
import { deletePost, publishPost } from "../actions";

export type CmsPostTableRow = CmsPostRow & {
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

export function CmsPostsTable({ posts }: { posts: CmsPostTableRow[] }) {
  const columns: DataTableColumn<CmsPostTableRow>[] = [
    { id: "title", header: "Title", sortValue: (post) => post.title, cell: (post) => post.title },
    { id: "slug", header: "Slug", sortValue: (post) => post.slug, cell: (post) => post.slug },
    { id: "status", header: "Status", sortValue: (post) => post.status, cell: (post) => post.status },
    {
      id: "author",
      header: "Author",
      sortValue: (post) => post.authorName ?? post.authorId ?? "",
      cell: (post) => post.authorName ?? post.authorId ?? "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: (post) => (
        <div className="cms-row-actions">
          {post.canEdit ? <Link href={`/cms/posts/${post.id}/edit`}>Edit</Link> : null}
          {post.canPublish && post.status === "draft" ? (
            <form className="cms-inline-form" action={publishPost}>
              <input type="hidden" name="postId" value={post.id} />
              <SubmitButton size="sm">Publish</SubmitButton>
            </form>
          ) : null}
          {post.canDelete ? (
            <form className="cms-inline-form" action={deletePost}>
              <input type="hidden" name="postId" value={post.id} />
              <SubmitButton size="sm" variant="destructive">Delete</SubmitButton>
            </form>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={posts}
      columns={columns}
      rowId={(post) => post.id}
      rowAttributes={(post) => ({ "data-post-id": post.id })}
      className="cms-table"
      caption="CMS posts"
      searchPlaceholder="Search posts"
      getSearchText={(post) => [post.title, post.slug, post.status, post.authorName].filter(Boolean).join(" ")}
      filters={[
        {
          id: "status",
          label: "Status",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
          predicate: (post, value) => post.status === value,
        },
      ]}
      emptyState={{
        title: "No posts yet",
        description: "Create a post to see it in this list.",
      }}
    />
  );
}
