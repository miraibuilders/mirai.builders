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
    <main id="main-content">
      <section className="section">
        <div className="container">
          <h1>{t(siteContent.blogPage.title, locale)}</h1>
          <p className="section-lead">{t(siteContent.blogPage.lead, locale)}</p>
          <div className="cards">
            {posts.map((post) => (
              <article className="card" key={post.id}>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="case-meta">
                  {post.publishedAt?.toISOString().slice(0, 10) ?? t(siteContent.blogPage.datePlaceholder, locale)}
                </p>
                <p>{post.seoDescription ?? t(siteContent.blogPage.summaryPlaceholder, locale)}</p>
              </article>
            ))}
          </div>
          {posts.length === 0 ? <p>{t(siteContent.blogPage.empty, locale)}</p> : null}
        </div>
      </section>
    </main>
  );
}
