import { listCmsAuthors } from "@/lib/cms";
import { requireCmsAdmin } from "@/lib/cms-auth";
import { InlineBanner, Input, PageHeader, SectionHeader, SubmitButton, Textarea } from "@/ui";
import { createAuthor } from "../actions";

export const dynamic = "force-dynamic";

export default async function CmsAuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireCmsAdmin();
  const [authors, { notice }] = await Promise.all([listCmsAuthors(), searchParams]);

  return (
    <div className="cms-page">
      <PageHeader title="Authors" description="Content bylines linked to internal users." />
      {notice ? <InlineBanner tone="success">{notice}</InlineBanner> : null}
      <div className="ui-table-viewport ui-table-viewport--plain">
        <table className="cms-table ui-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Bio</th>
            <th>Photo URL</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {authors.length === 0 ? (
            <tr><td colSpan={4}>No authors yet.</td></tr>
          ) : authors.map((author) => (
            <tr key={author.id}>
              <td>{author.name}</td>
              <td>{author.bio ?? "-"}</td>
              <td>{author.photoUrl ?? "-"}</td>
              <td>{author.userName ?? author.userId ?? "-"}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <SectionHeader title="New author" />
      <form className="cms-form ui-form-stack" action={createAuthor}>
        <label className="field">Name<Input name="name" required /></label>
        <label className="field">Bio<Textarea name="bio" rows={3} /></label>
        <label className="field">Photo URL<Input name="photoUrl" type="url" /></label>
        <label className="field">User ID<Input name="userId" /></label>
        <SubmitButton className="ui-form-submit">Save author</SubmitButton>
      </form>
    </div>
  );
}
