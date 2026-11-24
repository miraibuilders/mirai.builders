import { notFound, redirect } from "next/navigation";
import { canEditCmsPost, requireCmsEditor } from "@/lib/cms-auth";
import { getCmsPost } from "@/lib/cms";
import { ButtonLink, InlineBanner, PageHeader } from "@/ui";
import { PostForm } from "../../../_components/post-form";
import { updatePost } from "../../../actions";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditCmsPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const actor = await requireCmsEditor();
  const [{ id }, { notice }] = await Promise.all([params, searchParams]);
  if (!UUID_PATTERN.test(id)) notFound();
  const post = await getCmsPost(id);
  if (!post) notFound();
  if (!canEditCmsPost(actor.role, post.authorId, actor.userId)) redirect("/cms?notice=CMS_FORBIDDEN");

  return (
    <div className="cms-page">
      <PageHeader
        title={`Edit post: ${post.title}`}
        description={`Status: ${post.status}`}
        actions={<ButtonLink href="/cms" variant="secondary">Back to CMS</ButtonLink>}
      />
      {notice ? <div className="cms-notice"><InlineBanner tone="success">{notice}</InlineBanner></div> : null}
      <PostForm action={updatePost} post={post} />
    </div>
  );
}
