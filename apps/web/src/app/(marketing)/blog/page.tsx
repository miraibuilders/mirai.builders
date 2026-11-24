import Link from "next/link";
import { siteContent, t, type Locale } from "@/content/site";
import { listPublishedPosts } from "@/lib/cms";
import { withPublicFallback } from "@/lib/public-content";

const locale: Locale = "ja";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await withPublicFallback<Awaited<ReturnType<typeof listPublishedPosts>>>(
    () => listPublishedPosts(),
    [],
    { kind: "public_blog_fallback", route: "/blog" },
  );

  return (
    <main id="main-content" className="lp-legal-main lp-blog-main">
      <section className="lp-section">
        <div className="lp-container">
          <p className="lp-section-number">INSIGHTS / ARCHIVE</p>
          <h1 className="lp-h1">{t(siteContent.blogPage.title, locale)}</h1>
          <p className="lp-lead">{t(siteContent.blogPage.lead, locale)}</p>
          <div className="lp-blog-grid">
            {posts.map((post) => (
              <article className="lp-blog-card" key={post.id}>
                <p className="case-meta">
                  {post.publishedAt?.toISOString().slice(0, 10) ?? t(siteContent.blogPage.datePlaceholder, locale)}
                </p>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.seoDescription ?? t(siteContent.blogPage.summaryPlaceholder, locale)}</p>
                <Link className="lp-text-link" href={`/blog/${post.slug}`}>
                  →
                </Link>
              </article>
            ))}
          </div>
          {posts.length === 0 ? <p className="lp-lead">{t(siteContent.blogPage.empty, locale)}</p> : null}
        </div>
      </section>
    </main>
  );
}
