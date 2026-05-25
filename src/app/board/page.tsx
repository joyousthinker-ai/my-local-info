import CustomBoard from '@/components/CustomBoard';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '자유게시판 | 애들레이드 생활 정보',
  description: '애들레이드에 사는 교민, 유학생, 워홀러들이 자유롭게 의견을 나누고 정보를 공유하는 공간입니다.',
  robots: 'index, follow',
};

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200 py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl transform group-hover:scale-110 transition-transform">🏘️</span>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-400 tracking-tight">ADELAIDE LIFE</span>
          </Link>
          <nav className="flex space-x-1 sm:space-x-4 bg-slate-100 p-1 rounded-xl">
            <Link href="/" className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-orange-500 transition-all">홈</Link>
            <Link href="/blog" className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-orange-500 transition-all">블로그</Link>
            <Link href="/board" className="px-5 py-2 rounded-lg text-sm font-bold bg-white text-orange-600 shadow-sm transition-all">게시판</Link>
            <Link href="/about" className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-orange-500 transition-all">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-12 pb-24">

        {/* 페이지 헤더 */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl shadow-lg shadow-orange-200 mb-6">
            <span className="text-3xl">💬</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">자유게시판</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            애들레이드에서 생활하는 분들과 자유롭게 정보를 나누고<br />
            질문하고 리뷰를 남겨보세요 😊
          </p>
        </div>

        {/* 이용 안내 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '🙋', title: '질문·답변', desc: '애들레이드 생활, 이민, 유학 무엇이든 물어보세요' },
            { icon: '⭐', title: '장소 리뷰', desc: '맛집, 쇼핑, 병원 등 직접 경험한 솔직한 리뷰' },
            { icon: '📢', title: '정보 공유', desc: '유용한 꿀팁, 행사 후기를 함께 나눠요' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center hover:border-orange-200 hover:shadow-md transition-all">
              <span className="text-3xl block mb-3">{item.icon}</span>
              <p className="text-sm font-bold text-slate-800 mb-1">{item.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 이용 규칙 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-10 flex items-start gap-3">
          <span className="text-xl mt-0.5">📌</span>
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1">이용 안내</p>
            <ul className="space-y-1 text-amber-700 text-xs leading-relaxed list-disc list-inside">
              <li>회원가입 없이 <strong>이름(닉네임)과 삭제용 비밀번호</strong>만 입력하면 즉시 작성이 가능합니다.</li>
              <li>본인이 쓴 글은 댓글 카드 우측의 쓰레기통(🗑️) 아이콘을 눌러 비밀번호를 치면 안전하게 지울 수 있습니다.</li>
              <li>서로 존중하는 따뜻한 언어를 사용해 주세요.</li>
            </ul>
          </div>
        </div>

        {/* Giscus 게시판 */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center text-base">💬</span>
            방문자 한 줄 이야기 & 별점 리뷰
          </h2>
          <CustomBoard />
        </div>

      </main>

      {/* 푸터 */}
      <footer className="bg-slate-900 py-10 text-slate-400 px-6 text-center text-sm">
        <p className="mb-2">
          <Link href="/" className="hover:text-white transition-colors font-bold mr-4">HOME</Link>
          <Link href="/blog" className="hover:text-white transition-colors font-bold mr-4">BLOG</Link>
          <Link href="/board" className="hover:text-white transition-colors font-bold mr-4">게시판</Link>
          <Link href="/about" className="hover:text-white transition-colors font-bold">ABOUT</Link>
        </p>
        <p className="text-xs opacity-50">© {new Date().getFullYear()} 애들레이드 생활 정보. All rights reserved.</p>
      </footer>
    </div>
  );
}
