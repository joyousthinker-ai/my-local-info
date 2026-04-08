export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://adelaide-info.pages.dev/sitemap.xml',
  };
}
