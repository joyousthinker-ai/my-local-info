import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function BlogList() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 font-sans py-12 px-4 selection:bg-orange-200">
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
