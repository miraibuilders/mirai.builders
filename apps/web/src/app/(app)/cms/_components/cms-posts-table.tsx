"use client";

import { Avatar, Badge, ButtonLink, DataTable, Icon, SubmitButton, type DataTableColumn } from "@/ui";
import type { CmsPostRow } from "@/lib/cms";
import { deletePost, publishPost } from "../actions";

export type CmsPostTableRow = CmsPostRow & {
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

export function CmsPostsTable({ posts }: { posts: CmsPostTableRow[] }) {
  const columns: DataTableColumn<CmsPostTableRow>[] = [
    {
      id: "title",
      header: "Title",
      sortValue: (post) => post.title,
      cell: (post) => <span className="ui-font-medium">{post.title}</span>,
    },
    {
      id: "slug",
      header: "Slug",
      sortValue: (post) => post.slug,
      cell: (post) => <span className="ui-mono">/{post.slug}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (post) => post.status,
      cell: (post) => (
        <Badge tone={post.status === "published" ? "success" : "warning"} icon={post.status === "published" ? "check-circle" : "clock"}>
          {post.status}
        </Badge>
      ),
    },
    {
      id: "author",
      header: "Author",
      sortValue: (post) => post.authorName ?? post.authorId ?? "",
      cell: (post) => {
        const name = post.authorName ?? post.authorId ?? "-";
        return (
          <span className="cms-identity-cell">
            <Avatar name={name} size="sm" />
            <span>{name}</span>
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (post) => (
        <div className="cms-row-actions">
          {post.canEdit ? (
            <ButtonLink href={`/cms/posts/${post.id}/edit`} variant="ghost" size="sm" icon="edit">
              Edit
            </ButtonLink>
          ) : null}
          {post.canPublish && post.status === "draft" ? (
            <form className="cms-inline-form" action={publishPost}>
              <input type="hidden" name="postId" value={post.id} />
              <SubmitButton size="sm">
                <Icon name="eye" />
                Publish
              </SubmitButton>
            </form>
          ) : null}
          {post.canDelete ? (
            <form className="cms-inline-form" action={deletePost}>
              <input type="hidden" name="postId" value={post.id} />
              <SubmitButton size="sm" variant="destructive">
                <Icon name="trash" />
                Delete
              </SubmitButton>
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
