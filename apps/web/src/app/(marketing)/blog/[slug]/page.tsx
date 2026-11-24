import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteContent, t, type Locale } from "@/content/site";
import { getPublishedPostBySlug } from "@/lib/cms";
import { articleJsonLd, faqJsonLd } from "@/lib/json-ld";
import { renderMarkdown } from "@/lib/markdown";
import { withPublicFallback } from "@/lib/public-content";
import { siteOrigin } from "@/lib/site";

const locale: Locale = "ja";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await withPublicFallback<Awaited<ReturnType<typeof getPublishedPostBySlug>>>(
    () => getPublishedPostBySlug(slug),
    null,
    { kind: "public_blog_post_fallback", route: "/blog/[slug]" },
  );
  if (!post) return { title: t(siteContent.metaDescriptions.blogPostNotFound, locale) };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? t(siteContent.blogPage.summaryPlaceholder, locale),
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await withPublicFallback<Awaited<ReturnType<typeof getPublishedPostBySlug>>>(
    () => getPublishedPostBySlug(slug),
    null,
    { kind: "public_blog_post_fallback", route: "/blog/[slug]" },
  );
  if (!post) notFound();

  const article = articleJsonLd(post, siteOrigin());
  const faq = faqJsonLd(post.faqJsonLd);

  return (
    <main id="main-content" className="lp-legal-main lp-blog-post-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      {faq ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      ) : null}
      <article className="lp-section">
        <div className="lp-container lp-blog-post-shell">
          <p className="case-meta">
            <Link className="lp-text-link" href="/blog">
              ← {t(siteContent.blogPage.back, locale)}
            </Link>
          </p>
          <h1 className="lp-h1">{post.title}</h1>
          <p className="case-meta">
            {post.authorName ?? t(siteContent.blogPage.authorPlaceholder, locale)} —{" "}
            {post.publishedAt?.toISOString().slice(0, 10) ?? t(siteContent.blogPage.datePlaceholder, locale)}
          </p>
          <div className="blog-body">{renderMarkdown(post.bodyMd)}</div>
        </div>
      </article>
    </main>
  );
}
