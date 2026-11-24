import { getCrmActor } from "@/lib/crm-auth";
import {
  canCreateCmsPost,
  canDeleteCmsPost,
  canEditCmsPost,
  canManageCmsAuthors,
  canPublishCmsPost,
  canUploadCmsMedia,
} from "@/lib/cms-auth";
import { listCmsPosts } from "@/lib/cms";
import { Badge, ButtonLink, InlineBanner, PageHeader, SectionHeader } from "@/ui";
import { CmsPostsTable } from "./_components/cms-posts-table";

export const dynamic = "force-dynamic";

export default async function CmsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [actor, posts, { notice }] = await Promise.all([
    getCrmActor(),
    listCmsPosts(),
    searchParams,
  ]);
  if (!actor) return null;

  const postRows = posts.map((post) => ({
    ...post,
    canEdit: canEditCmsPost(actor.role, post.authorId, actor.userId),
    canPublish: canPublishCmsPost(actor.role),
    canDelete: canDeleteCmsPost(actor.role),
  }));

  return (
    <div className="cms-page">
      <PageHeader
        title="CMS"
        description="Posts, authors, media, and site settings."
        actions={
          <nav className="cms-nav" aria-label="CMS sections">
            {canCreateCmsPost(actor.role) ? <ButtonLink href="/cms/posts/new">New post</ButtonLink> : null}
            {canManageCmsAuthors(actor.role) ? (
              <ButtonLink href="/cms/authors" variant="secondary">Authors</ButtonLink>
            ) : null}
            {canManageCmsAuthors(actor.role) ? (
              <ButtonLink href="/cms/site" variant="secondary">Site settings</ButtonLink>
            ) : null}
            {canUploadCmsMedia(actor.role) ? (
              <ButtonLink href="/cms/media" variant="secondary">Media</ButtonLink>
            ) : null}
          </nav>
        }
      />
      {notice ? (
        <div className="cms-notice">
          <InlineBanner tone="success">{notice}</InlineBanner>
        </div>
      ) : null}
      <div className="cms-kpis">
        <div className="cms-kpi">
          <span>All posts</span>
          <strong>{posts.length}</strong>
        </div>
        <div className="cms-kpi">
          <span>Drafts</span>
          <strong>{posts.filter((post) => post.status === "draft").length}</strong>
        </div>
        <div className="cms-kpi">
          <span>Published</span>
          <strong>{posts.filter((post) => post.status === "published").length}</strong>
        </div>
      </div>
      <SectionHeader
        title="Posts"
        description="Draft and published content."
        actions={<Badge tone="brand" icon="file">{posts.length} total</Badge>}
      />
      <CmsPostsTable posts={postRows} />
    </div>
  );
}
