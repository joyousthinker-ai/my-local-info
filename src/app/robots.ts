export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://my-local-info-6ul.pages.dev/sitemap.xml',
  };
}
