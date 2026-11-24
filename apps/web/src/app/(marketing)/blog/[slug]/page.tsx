import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteContent, t, type Locale } from "@/content/site";
import { getPublishedPostBySlug } from "@/lib/cms";
import { articleJsonLd, faqJsonLd } from "@/lib/json-ld";
import { renderMarkdown } from "@/lib/markdown";
import { siteOrigin } from "@/lib/site";

const locale: Locale = "ja";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: t(siteContent.metaDescriptions.blogPostNotFound, locale) };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? t(siteContent.blogPage.summaryPlaceholder, locale),
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const article = articleJsonLd(post, siteOrigin());
  const faq = faqJsonLd(post.faqJsonLd);

  return (
    <main id="main-content">
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
      <article className="section">
        <div className="container">
          <p className="case-meta">
            <Link href="/blog">{t(siteContent.blogPage.back, locale)}</Link>
          </p>
          <h1>{post.title}</h1>
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
