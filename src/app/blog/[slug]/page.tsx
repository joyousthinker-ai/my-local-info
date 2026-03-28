import { getPostData, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      </main>
    </div>
  );
}
