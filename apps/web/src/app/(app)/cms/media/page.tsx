import Image from "next/image";
import { getCrmActor } from "@/lib/crm-auth";
import { listCmsMedia } from "@/lib/cms";
import { canUploadCmsMedia } from "@/lib/cms-auth";
import { Badge, EmptyState, Icon, InlineBanner, Input, PageHeader, SectionHeader, SubmitButton } from "@/ui";
import { uploadMedia } from "../actions";
import { MediaUrlCopy } from "../_components/media-url-copy";

export const dynamic = "force-dynamic";

function safeImageSrc(value: string) {
  return /^(https?:\/\/|\/)/.test(value) ? value : null;
}

function formatSize(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

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
      <PageHeader
        title="Media"
        description="Uploaded assets used by CMS posts and site settings."
        actions={<Badge tone="brand" icon="file">{items.length} assets</Badge>}
      />
      {notice ? <div className="cms-notice"><InlineBanner tone="success">{notice}</InlineBanner></div> : null}
      {canUploadCmsMedia(actor.role) ? (
        <section className="cms-card cms-upload-card">
          <SectionHeader title="Upload media" description="Allowed types: PNG, JPEG, WebP, GIF, PDF (max 10 MB)." />
          <form className="cms-form ui-form-stack" action={uploadMedia} encType="multipart/form-data">
            <label className="cms-upload-drop">
              <Icon name="plus" />
              <span>Select a file to upload</span>
              <Input type="file" name="file" required aria-label="Media file" />
            </label>
            <SubmitButton className="ui-form-submit">Upload</SubmitButton>
          </form>
        </section>
      ) : null}
      <div className="ui-table-viewport ui-table-viewport--plain">
        <table className="cms-table ui-table">
          <caption className="ui-sr-only">Media library</caption>
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
              <tr>
                <td colSpan={4}>
                  <EmptyState title="No media uploaded yet." description="Uploaded files will appear here." />
                </td>
              </tr>
            ) : items.map((item) => {
              const src = safeImageSrc(item.url);
              return (
                <tr key={item.id}>
                  <td>
                    <span className="cms-identity-cell">
                      {src ? (
                        <Image className="media-thumb" src={src} alt="" width={36} height={36} unoptimized />
                      ) : (
                        <span className="media-thumb-placeholder"><Icon name="file" /></span>
                      )}
                      <span className="ui-font-medium">{item.filename}</span>
                    </span>
                  </td>
                  <td><Badge tone="info" className="ui-mono">{item.mime}</Badge></td>
                  <td className="ui-mono">{formatSize(item.size)}</td>
                  <td>
                    <span className="cms-row-actions">
                      <a className="ui-mono" href={item.url}>{item.url}</a>
                      <MediaUrlCopy url={item.url} filename={item.filename} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
