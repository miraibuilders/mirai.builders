import { listCmsAuthors } from "@/lib/cms";
import { requireCmsAdmin } from "@/lib/cms-auth";
import { Avatar, Badge, EmptyState, InlineBanner, Input, PageHeader, SectionHeader, SubmitButton, Textarea } from "@/ui";
import { createAuthor } from "../actions";

export const dynamic = "force-dynamic";

function safeImageSrc(value: string | null) {
  return value && /^(https?:\/\/|\/)/.test(value) ? value : null;
}

export default async function CmsAuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireCmsAdmin();
  const [authors, { notice }] = await Promise.all([listCmsAuthors(), searchParams]);

  return (
    <div className="cms-page">
      <PageHeader
        title="Authors"
        description="Content bylines linked to internal users."
        actions={<Badge tone="brand" icon="user">{authors.length} authors</Badge>}
      />
      {notice ? <div className="cms-notice"><InlineBanner tone="success">{notice}</InlineBanner></div> : null}
      <div className="cms-split-grid">
        <div className="cms-card">
          <SectionHeader title="Author directory" description="Byline records used on published posts." />
          <div className="ui-table-viewport ui-table-viewport--plain">
            <table className="cms-table ui-table">
              <caption className="ui-sr-only">Authors</caption>
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
                  <tr>
                    <td colSpan={4}>
                      <EmptyState title="No authors yet." description="Add a byline to get started." />
                    </td>
                  </tr>
                ) : authors.map((author) => (
                  <tr key={author.id}>
                    <td>
                      <span className="cms-identity-cell">
                        <Avatar name={author.name} src={safeImageSrc(author.photoUrl)} size="sm" />
                        <span className="ui-font-medium">{author.name}</span>
                      </span>
                    </td>
                    <td className="cms-bio-cell">{author.bio ?? "-"}</td>
                    <td className="ui-mono">{author.photoUrl ?? "-"}</td>
                    <td>
                      <Badge tone={author.userName ? "success" : "neutral"}>
                        {author.userName ?? author.userId ?? "-"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section className="cms-card">
          <SectionHeader title="New author" description="Link a byline to an internal user." />
          <form className="cms-form ui-form-stack" action={createAuthor}>
            <label className="field">Name<Input name="name" required /></label>
            <label className="field">Bio<Textarea name="bio" rows={3} /></label>
            <label className="field">Photo URL<Input name="photoUrl" type="url" className="ui-mono" /></label>
            <label className="field">User ID<Input name="userId" className="ui-mono" /></label>
            <SubmitButton className="ui-form-submit">Save author</SubmitButton>
          </form>
        </section>
      </div>
    </div>
  );
}
