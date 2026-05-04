import { getAllPostSlugs, getSortedPostsData } from '@/lib/posts';

export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://my-local-info-6ul.pages.dev';
  const slugs = getAllPostSlugs();
  const posts = getSortedPostsData();

  // slug → date 매핑
  const dateMap: Record<string, string> = {};
  posts.forEach(p => { dateMap[p.slug] = p.date; });

  const blogPosts = slugs.map(({ slug }) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: dateMap[slug] ? new Date(dateMap[slug]) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...blogPosts,
  ];
}
