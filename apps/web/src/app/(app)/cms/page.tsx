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
import { ButtonLink, InlineBanner, PageHeader, SectionHeader } from "@/ui";
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
            {canManageCmsAuthors(actor.role) ? <ButtonLink href="/cms/authors" variant="secondary">Authors</ButtonLink> : null}
            {canManageCmsAuthors(actor.role) ? <ButtonLink href="/cms/site" variant="secondary">Site settings</ButtonLink> : null}
            {canUploadCmsMedia(actor.role) ? <ButtonLink href="/cms/media" variant="secondary">Media</ButtonLink> : null}
          </nav>
        }
      />
      {notice ? <InlineBanner tone="success">{notice}</InlineBanner> : null}
      <SectionHeader title="Posts" description="Draft and published content." />
      <CmsPostsTable posts={postRows} />
    </div>
  );
}
