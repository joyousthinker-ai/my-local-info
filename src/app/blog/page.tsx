import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "남호주 애들레이드 생활 블로그 | 이민·정착·여행 실전 가이드",
  description: "남호주 애들레이드 유학, 워홀, 이민에 필요한 모든 정보. 운전면허 교환, Medicare, 렌트, 학교, 바로사밸리, 콗거루아일랜드 여행까지 함쳐 담았습니다.",
  keywords: [
    "애들레이드 블로그", "남호주 생활", "호주 이민 가이드", "호주 워홀 정보",
    "Adelaide blog", "South Australia life", "애들레이드 유학", "남호주 여행"
  ],
  alternates: {
    canonical: "https://my-local-info-6ul.pages.dev/blog",
  },
  openGraph: {
    title: "남호주 애들레이드 생활 블로그",
    description: "남호주 애들레이드 유학, 워홀, 이민 필수 실전 정보 모음.",
    url: "https://my-local-info-6ul.pages.dev/blog",
    type: "website",
  },
};

export default function BlogList() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 font-sans py-12 px-4 selection:bg-orange-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "애들레이드 생활 정보 블로그",
            "description": "남호주 애들레이드 교민, 유학생, 워홀러를 위한 생활 가이드 블로그",
            "url": "https://my-local-info-6ul.pages.dev/blog",
            "inLanguage": "ko",
            "blogPost": posts.slice(0, 10).map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.summary,
              "datePublished": post.date,
              "url": `https://my-local-info-6ul.pages.dev/blog/${post.slug}`,
            }))
          })
        }}
      />
      <main className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold text-orange-950">📝 블로그</h1>
          <div className="flex bg-orange-200/50 rounded-lg p-1 font-bold shadow-sm">
             <Link href="/" className="px-5 py-2 rounded-md text-orange-800 hover:text-orange-950 transition-colors">홈</Link>
             <Link href="/blog" className="px-5 py-2 rounded-md text-white bg-orange-500 shadow-sm transition-colors">블로그</Link>
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100">
            <p className="text-slate-500 text-lg">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <article key={post.slug} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="flex items-center space-x-3 mb-3">
                    {post.category && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                    )}
                    <span className="text-sm text-slate-500 font-medium">📅 {post.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {post.summary}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-4">
                       {post.tags.map(tag => (
                         <span key={tag} className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                           #{tag}
                         </span>
                       ))}
                     </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
