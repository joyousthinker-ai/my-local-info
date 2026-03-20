import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

// Next.js 정적 배포(Static Export)를 위한 설정
// 블로그 글처럼 미리 페이지를 찍어내 속도를 빠르게 해줍니다.
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  const fileContent = await fs.readFile(filePath, 'utf8');
  const data: InfoItem[] = JSON.parse(fileContent);

  return data.map((item) => ({
    id: item.id.toString(),
  }));
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. 가져온 주소의 ID 값 확인 (Next.js 최신 방식에 맞춰 비동기로 읽어옵니다)
  const resolvedParams = await params;
  const idToFind = resolvedParams.id;

  // 2. 전체 데이터 불러오기
  const filePath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  const fileContent = await fs.readFile(filePath, 'utf8');
  const data: InfoItem[] = JSON.parse(fileContent);

  // 3. 현재 주소(idToFind)와 일치하는 항목 찾기
  const item = data.find((d) => d.id.toString() === idToFind);

  // 만약 못 찾으면 '페이지를 찾을 수 없음(404)' 처리
  if (!item) {
    return notFound();
  }

  // 4. 행사는 행사끼리, 혜택은 혜택끼리 테마 색상을 맞춰줍니다.
  const isEvent = item.category === '행사/축제';
  const badgeClass = isEvent 
    ? "text-orange-600 bg-orange-100" 
    : "text-emerald-700 bg-emerald-100";
  const buttonClass = isEvent 
    ? "bg-orange-500 hover:bg-orange-600" 
    : "bg-emerald-500 hover:bg-emerald-600";

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 font-sans py-12 px-4 selection:bg-orange-200">
      <main className="max-w-3xl mx-auto">
        
        {/* 뒤로 가기 버튼 */}
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors text-lg"
        >
          ← 목록으로 돌아가기
        </Link>
        
        {/* 상세 정보 카드 */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          
          {/* 상단 제목 영역 */}
          <div className="px-6 py-10 sm:px-10 border-b border-slate-100">
            <div className={`text-sm font-bold inline-block px-3 py-1 rounded-full mb-4 ${badgeClass}`}>
              {item.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-snug mb-2">
              {item.title}
            </h1>
          </div>

          {/* 핵심 정보 영역 */}
          <div className="px-6 py-8 sm:px-10 bg-slate-50/50 border-b border-slate-100 space-y-5">
            <div className="flex items-start">
              <span className="text-2xl mr-4 mt-1">📅</span>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">운영 기간</p>
                <p className="text-lg font-medium text-slate-800">{item.startDate} ~ {item.endDate}</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-4 mt-1">📍</span>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">상세 장소</p>
                <p className="text-lg font-medium text-slate-800">{item.location}</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-4 mt-1">👥</span>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">대상자</p>
                <p className="text-lg font-medium text-slate-800">{item.target}</p>
              </div>
            </div>
          </div>

          {/* 상세 설명 영역 */}
          <div className="px-6 py-10 sm:px-10">
            <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
              <span className="w-1.5 h-6 bg-slate-300 rounded-full mr-3 block"></span> 
              상세 설명
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
              {item.summary}
            </p>
          </div>

          {/* 하단 지원 버튼 영역 */}
          <div className="px-6 py-8 sm:px-10 bg-slate-50 text-center border-t border-slate-100">
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-block w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-md transition-transform hover:-translate-y-1 ${buttonClass}`}
            >
              원본 사이트에서 자세히 보기 →
            </a>
          </div>

        </div>
      </main>
    </div>
  );
}
