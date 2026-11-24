import { siteContent, t, type Locale } from "@/content/site";
import { listPublishedPosts } from "@/lib/cms";
import { mergeSiteContent, getSiteSettings } from "@/lib/settings";
import { siteOrigin } from "@/lib/site";

const locale: Locale = "ja";

export const dynamic = "force-dynamic";

export async function GET() {
  const [posts, settings] = await Promise.all([listPublishedPosts(), getSiteSettings()]);
  const content = mergeSiteContent(settings, [], []);
  const baseUrl = siteOrigin();
  const postLines = posts.map(
    (post) => `- [${post.title}](${baseUrl}/blog/${post.slug})`,
  );
  const body = `# ${t(content.brand.name, locale)}

> ${t(siteContent.llmsTxt.description, locale)}

## Site
- [${t(siteContent.llmsTxt.home, locale)}](${baseUrl}/)
- [${t(siteContent.llmsTxt.blog, locale)}](${baseUrl}/blog)

## Services
- ${t(content.offer.name, locale)} - ${t(siteContent.llmsTxt.externalCheckNote, locale)}

## Contact
- ${t(content.about.authorName, locale)}
- ${content.contact.phone}

## Published posts
${postLines.length > 0 ? postLines.join("\n") : `- ${t(siteContent.llmsTxt.noPosts, locale)}`}

## Notes
- ${t(siteContent.llmsTxt.crawlersLine, locale)}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
