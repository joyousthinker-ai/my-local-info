import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';
import AdBanner from '@/components/AdBanner';
import CoupangBanner from '@/components/CoupangBanner';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const postData = getPostData(resolvedParams.slug);
  if (!postData) return {};
  return {
    title: `${postData.title} | 애들레이드 생활 정보`,
    description: postData.summary,
    openGraph: {
      title: postData.title,
      description: postData.summary,
      type: 'article',
      publishedTime: postData.date,
    },
  };
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs;
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const postData = getPostData(resolvedParams.slug);

  if (!postData) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-12 px-4 selection:bg-orange-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": postData.title,
              "datePublished": postData.date,
              "description": postData.summary,
              "author": {
                "@type": "Organization",
                "name": "애들레이드 생활 정보"
              },
              "publisher": {
                "@type": "Organization",
                "name": "애들레이드 생활 정보"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "홈",
                  "item": "https://my-local-info-6ul.pages.dev"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "블로그",
                  "item": "https://my-local-info-6ul.pages.dev/blog"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": postData.title,
                  "item": `https://my-local-info-6ul.pages.dev/blog/${postData.slug}`
                }
              ]
            }
          ])
        }}
      />
      <main className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-orange-600 hover:text-orange-800 font-bold mb-8 transition-colors"
        >
          ← 목록으로 돌아가기
        </Link>
        
        <header className="mb-10 border-b border-slate-100 pb-8">
          {postData.category && (
            <span className="text-sm font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full inline-block mb-4">
              {postData.category}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tight">
            {postData.title}
          </h1>
          <div className="text-slate-500 text-sm font-medium flex items-center space-x-4">
            <span>📅 {postData.date}</span>
          </div>
        </header>

        <article className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-orange-600 hover:prose-a:text-orange-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {postData.content}
          </ReactMarkdown>
        </article>
        
        {postData.tags && postData.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            {postData.tags.map((tag: string) => (
              <span key={tag} className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 text-xs text-slate-400 font-medium">
          🕐 최종 업데이트: {postData.date}
        </div>

        {postData.link && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-600 font-medium mb-1">📎 원문 출처</p>
            <a
              href={postData.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-800 underline break-all"
            >
              {postData.link}
            </a>
          </div>
        )}

        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-700 leading-relaxed">
            ⚠️ 이 글은{' '}
            <a
              href="https://www.sa.gov.au/topics/about-sa/today-in-sa"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold hover:text-amber-900"
            >
              남호주 포털(SA.GOV.AU)
            </a>
            의 정보를 바탕으로 AI가 작성하였습니다. 정확한 내용은 원문 링크를 통해 확인해주세요.
          </p>
        </div>

        <AdBanner />
        
        <CoupangBanner />
      </main>
    </div>
  );
}
