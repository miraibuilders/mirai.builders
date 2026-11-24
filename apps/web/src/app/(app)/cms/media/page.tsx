import { getCrmActor } from "@/lib/crm-auth";
import { listCmsMedia } from "@/lib/cms";
import { canUploadCmsMedia } from "@/lib/cms-auth";
import { InlineBanner, Input, PageHeader, SectionHeader, SubmitButton } from "@/ui";
import { uploadMedia } from "../actions";

export const dynamic = "force-dynamic";

export default async function CmsMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [actor, items, { notice }] = await Promise.all([
    getCrmActor(),
    listCmsMedia(),
    searchParams,
  ]);
  if (!actor) return null;

  return (
    <div className="cms-page">
      <PageHeader title="Media" description="Uploaded assets used by CMS posts and site settings." />
      {notice ? <InlineBanner tone="success">{notice}</InlineBanner> : null}
      <div className="ui-table-viewport ui-table-viewport--plain">
        <table className="cms-table ui-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>MIME type</th>
            <th>Size</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={4}>No media uploaded yet.</td></tr>
          ) : items.map((item) => (
            <tr key={item.id}>
              <td>{item.filename}</td>
              <td>{item.mime}</td>
              <td>{item.size}</td>
              <td>{item.url}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      {canUploadCmsMedia(actor.role) ? (
        <section className="cms-upload-section">
          <SectionHeader title="Upload media" />
          <form className="cms-form ui-form-stack" action={uploadMedia} encType="multipart/form-data">
            <label className="field">File<Input type="file" name="file" required /></label>
            <SubmitButton className="ui-form-submit">Upload</SubmitButton>
          </form>
        </section>
      ) : null}
    </div>
  );
}
