import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 font-sans py-12 px-4 selection:bg-orange-200">
      <main className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold text-orange-950">📖 사이트 소개</h1>
          <div className="flex bg-orange-200/50 rounded-lg p-1 font-bold shadow-sm">
            <Link href="/" className="px-5 py-2 rounded-md text-orange-800 hover:text-orange-950 transition-colors">홈</Link>
            <Link href="/blog" className="px-5 py-2 rounded-md text-orange-800 hover:text-orange-950 transition-colors">블로그</Link>
            <Link href="/about" className="px-5 py-2 rounded-md text-white bg-orange-500 shadow-sm transition-colors">소개</Link>
          </div>
        </header>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🎯 운영 목적</h2>
          <p className="text-slate-600 leading-relaxed">
            이 사이트는 <strong>호주 사우스오스트레일리아(남호주) 주민</strong>과 애들레이드(Adelaide) 거주자를 위해
            지역 행사, 축제, 정부 지원금, 혜택 등의 생활 정보를 매일 수집·정리하여 제공합니다.
            바쁜 일상 속에서도 놓치기 쉬운 유용한 지역 정보를 한눈에 확인할 수 있도록 운영하고 있습니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🗃️ 데이터 출처</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            본 사이트의 정보는 아래 공공데이터 소스에서 수집됩니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>
              <a
                href="https://data.sa.gov.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-800 underline font-medium"
              >
                South Australia Government Open Data (data.sa.gov.au)
              </a>
            </li>
            <li>
              <a
                href="https://www.sa.gov.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-800 underline font-medium"
              >
                SA.GOV.AU - 남호주 공식 정부 포털
              </a>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🤖 콘텐츠 생성 방식</h2>
          <p className="text-slate-600 leading-relaxed">
            수집된 공공데이터는 <strong>Google Gemini AI</strong>를 활용하여 한국어로 요약·번역됩니다.
            AI가 생성한 콘텐츠는 정보 제공 목적으로만 사용되며, 정확한 내용은 반드시 원문 출처를 통해 확인하시기 바랍니다.
            모든 블로그 글 하단에는 원문 출처 링크와 AI 생성 여부가 명시되어 있습니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">⚠️ 면책 조항</h2>
          <p className="text-slate-600 leading-relaxed">
            본 사이트의 정보는 AI가 공공데이터를 바탕으로 자동 생성한 내용으로, 정확성을 보장하지 않습니다.
            중요한 사항은 반드시 공식 기관 홈페이지를 통해 최종 확인하시기 바랍니다.
          </p>
        </section>
      </main>
    </div>
  );
}
