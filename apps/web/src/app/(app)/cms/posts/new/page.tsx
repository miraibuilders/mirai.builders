import { requireCmsEditor } from "@/lib/cms-auth";
import { ButtonLink, InlineBanner, PageHeader } from "@/ui";
import { PostForm } from "../../_components/post-form";
import { createPost } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewCmsPostPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireCmsEditor();
  const { notice } = await searchParams;

  return (
    <div className="cms-page">
      <PageHeader
        title="New post"
        description="Create a draft, then publish it when it is ready."
        actions={<ButtonLink href="/cms" variant="secondary">Back to CMS</ButtonLink>}
      />
      {notice ? <div className="cms-notice"><InlineBanner tone="success">{notice}</InlineBanner></div> : null}
      <PostForm action={createPost} />
    </div>
  );
}
