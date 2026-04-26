import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import { getSortedPostsData } from '@/lib/posts';

// 데이터 타입 정의
type InfoItem = {
  id: number;
  category: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
};

export default async function Home() {
  // 로컬 파일에서 데이터 읽기 (행사/혜택)
  const filePath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  const fileContent = await fs.readFile(filePath, 'utf8');
  const data: InfoItem[] = JSON.parse(fileContent);

  // 블로그 데이터 가져오기
  const allPosts = getSortedPostsData();
  const latestPosts = allPosts.slice(0, 4); // 최신 4개 글
  const heroPost = latestPosts[0]; // 히어로 섹션용 최신글
  const recentGuides = latestPosts.slice(1, 4); // 나머지 3개 글

  // 카테고리별 분류
  const events = data.filter((item) => item.category === '행사/축제').slice(0, 3);
  const benefits = data.filter((item) => item.category === '지원금/혜택').slice(0, 4);

  // 최근 업데이트 날짜 측정
  const today = new Date().toLocaleDateString('ko-KR');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            ...events.map(item => ({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": item.title,
              "startDate": item.startDate,
              "endDate": item.endDate === '상시' ? undefined : item.endDate,
              "location": {
                "@type": "Place",
                "name": item.location,
                "address": item.location
              },
              "description": item.summary
            })),
            ...benefits.map(item => ({
              "@context": "https://schema.org",
              "@type": "GovernmentService",
              "name": item.title,
              "description": item.summary,
              "provider": {
                "@type": "GovernmentOrganization",
                "name": item.location || "South Australia Government"
              }
            }))
          ])
        }}
      />
      
      {/* 고정 헤더 - Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200 py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl transform group-hover:scale-110 transition-transform">🏘️</span>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400 tracking-tight">ADELAIDE LIFE</span>
          </Link>
          <nav className="flex space-x-1 sm:space-x-4 bg-slate-100 p-1 rounded-xl">
             <Link href="/" className="px-5 py-2 rounded-lg text-sm font-bold bg-white text-orange-600 shadow-sm transition-all">홈</Link>
             <Link href="/blog" className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-orange-500 transition-all">블로그</Link>
             <Link href="/about" className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-orange-500 transition-all">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 pb-20">
        
        {/* 히어로 섹션 - 최신 블로그 글 강조 */}
        {heroPost && (
          <section className="relative mb-16 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 flex flex-col md:flex-row min-h-[400px]">
              <div className="md:w-1/2 bg-gradient-to-br from-orange-500 to-orange-400 p-10 flex flex-col justify-center text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">Today's Essential</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                  {heroPost.title}
                </h2>
                <p className="text-orange-50 mb-8 text-lg opacity-90 line-clamp-3">
                  {heroPost.summary}
                </p>
                <Link href={`/blog/${heroPost.slug}`} className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl shadow-lg hover:bg-orange-50 transition-all group/btn w-fit">
                  자세히 읽기 
                  <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </div>
              <div className="md:w-1/2 bg-slate-50 p-10 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Update</p>
                      <p className="text-sm font-bold text-slate-700">{heroPost.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-2xl">🏷️</span>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Category</p>
                      <p className="text-sm font-bold text-slate-700">{heroPost.category || '생활정보'}</p>
                    </div>
                  </div>
                  {/* 방문자 수 카드 */}
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-2xl">👥</span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1.5">방문자 수</p>
                      <img
                        src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fmy-local-info-6ul.pages.dev&count_bg=%23F97316&title_bg=%23334155&icon=&icon_color=%23E7E7E7&title=Visitors&edge_flat=true"
                        alt="방문자 수"
                        className="h-5"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {heroPost.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] font-black px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 광고 영역 */}
        <div className="mb-16">
          <AdBanner />
        </div>

        {/* 섹션 1: 애들레이드 추천 가이드 (블로그) */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">💡 필수 가이드 & 팁</h3>
              <p className="text-slate-500 font-medium italic">애들레이드 정착과 생활에 꼭 필요한 실전 정보</p>
            </div>
            <Link href="/blog" className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center transition-colors">
              전체 보기 <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentGuides.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">{post.category}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors mb-4 line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">
                  {post.summary}
                </p>
                <div className="flex items-center text-xs font-black text-slate-700 pt-4 border-t border-slate-50 uppercase tracking-widest">
                  Read Article <svg className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 섹션 2: 행사/축제 & 혜택 (기존 데이터 통합) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-8">
              <span className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-2xl text-xl">🎉</span>
              <h3 className="text-2xl font-black text-slate-800">이번 주 주요 행사</h3>
            </div>
            <div className="space-y-4">
              {events.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 hover:border-orange-200 transition-colors">
                  <div className="flex-grow">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{item.summary}</p>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{item.startDate}</span>
                      <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{item.location}</span>
                    </div>
                  </div>
                  <Link href="/blog" className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-all text-center whitespace-nowrap">
                    관련 글 보기
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-8">
              <span className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-2xl text-xl">💰</span>
              <h3 className="text-2xl font-black text-slate-800">진행 중인 혜택</h3>
            </div>
            <div className="space-y-4">
              {benefits.map((item) => (
                <div key={item.id} className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200/50 hover:scale-[1.02] transition-transform">
                  <span className="text-[10px] font-black bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg uppercase tracking-widest mb-3 inline-block">Benefit</span>
                  <h4 className="text-lg font-bold mb-2 leading-tight">{item.title}</h4>
                  <p className="text-white/80 text-xs mb-6 line-clamp-2 leading-relaxed">{item.summary}</p>
                  <Link href="/blog" className="block w-full py-3 bg-white text-emerald-600 text-center text-xs font-black rounded-xl hover:bg-emerald-50 transition-colors uppercase tracking-widest">
                    자세히 보기
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <footer className="bg-slate-900 py-16 text-slate-400 px-6 mt-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
             <h4 className="text-xl font-black text-white mb-4">🏠 ADELAIDE LIFE</h4>
             <p className="text-sm max-w-sm leading-relaxed mb-6">애들레이드 정착부터 일상까지, 남호주 생활의 모든 정보를 담고 있습니다. 매일 업데이트되는 생생한 소식을 만나보세요.</p>
             <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Last Update: {today}</p>
          </div>
          <div className="flex flex-col md:items-end">
            <p className="text-sm text-slate-500 mb-6 italic text-left md:text-right">💡 본 사이트는 공공데이터를 기반으로<br />AI와 협력하여 제작되었습니다.</p>
            <div className="flex space-x-4">
              <Link href="/blog" className="text-xs font-black hover:text-white transition-colors">BLOG</Link>
              <Link href="/about" className="text-xs font-black hover:text-white transition-colors">ABOUT</Link>
              <Link href="/" className="text-xs font-black hover:text-white transition-colors">HOME</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
