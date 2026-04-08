import { getAllPostSlugs } from '@/lib/posts';

export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://adelaide-info.pages.dev';
  const slugs = getAllPostSlugs();

  const blogPosts = slugs.map(({ slug }) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
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
    ...blogPosts,
  ];
}
