import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

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
  // 로컬 파일에서 데이터 읽기
  const filePath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  const fileContent = await fs.readFile(filePath, 'utf8');
  const data: InfoItem[] = JSON.parse(fileContent);

  // 카테고리별 분류
  const events = data.filter((item) => item.category === '행사/축제');
  const benefits = data.filter((item) => item.category === '지원금/혜택');

  // 최근 업데이트 날짜 측정
  const today = new Date().toLocaleDateString('ko-KR');

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 font-sans">
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
      
      <header className="bg-orange-400 text-white p-6 shadow-md rounded-b-3xl mx-auto mb-10 max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">🏘️ 애들레이드(Adelaide) 생활 정보</h1>
          <div className="flex bg-orange-500/30 rounded-lg p-1 font-bold">
             <Link href="/" className="px-4 py-1.5 rounded-md text-white bg-orange-500/80 shadow-sm transition-colors">홈</Link>
             <Link href="/blog" className="px-4 py-1.5 rounded-md text-orange-100 hover:text-white transition-colors">블로그</Link>
             <Link href="/about" className="px-4 py-1.5 rounded-md text-orange-100 hover:text-white transition-colors">소개</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-12 space-y-12">
        
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-3xl">🎉</span>
            <h2 className="text-2xl font-semibold text-orange-950">이번 달 행사 / 축제</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map((item) => (
               <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                 <div className="text-xs font-semibold text-orange-600 bg-orange-100 inline-block px-3 py-1 rounded-full mb-3 self-start">
                   {item.category}
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                 <p className="text-sm text-slate-600 mb-5 flex-grow">{item.summary}</p>
                 
                 <div className="text-xs text-slate-500 space-y-1.5 mb-5 p-3 bg-slate-50 rounded-lg">
                   <p className="flex"><span className="w-5">📅</span>{item.startDate} ~ {item.endDate}</p>
                   <p className="flex"><span className="w-5">📍</span>{item.location}</p>
                   <p className="flex"><span className="w-5">👥</span>{item.target}</p>
                 </div>
                 
                 <Link href="/blog" className="mt-auto block w-full text-center bg-orange-100 text-orange-700 py-2.5 rounded-xl font-bold hover:bg-orange-200 transition-colors">
                   자세히 보기
                 </Link>
               </div>
            ))}
          </div>
        </section>

        {/* 광고 영역 */}
        <AdBanner />

        <section>
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-3xl">💰</span>
            <h2 className="text-2xl font-semibold text-emerald-950">놓치면 아쉬운 혜택</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between">
                <div className="flex-1 pr-4">
                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-100 inline-block px-3 py-1 rounded-full mb-3">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-5">{item.summary}</p>
                  
                  <div className="text-xs text-slate-500 space-y-1.5 p-3 bg-emerald-50/50 rounded-lg">
                    <p className="flex"><span className="w-5">📅</span>{item.startDate} ~ {item.endDate}</p>
                    <p className="flex"><span className="w-5">👥</span>{item.target}</p>
                    <p className="flex"><span className="w-5">📍</span>{item.location}</p>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-0 flex items-end">
                  <Link href="/blog" className="block w-full sm:w-auto text-center bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-sm whitespace-nowrap">
                    신청 바로가기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="bg-slate-100 py-8 text-center text-slate-500 text-sm border-t border-slate-200">
        <p className="mb-2">💡 본 웹사이트의 데이터는 남호주 정부(SA.GOV.AU) 등을 바탕으로 제공됩니다.</p>
        <p>마지막 업데이트: {today}</p>
      </footer>
    </div>
  );
}
