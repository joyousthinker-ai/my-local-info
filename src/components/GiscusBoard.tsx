'use client';

import { useEffect, useRef } from 'react';

// Giscus 설정값 - 나중에 .env.local에서 읽어옴
const GISCUS_REPO = process.env.NEXT_PUBLIC_GISCUS_REPO || '';
const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '';
const GISCUS_CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'General';
const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '';

export default function GiscusBoard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 이미 스크립트가 있으면 중복 로드 방지
    if (!containerRef.current) return;
    if (containerRef.current.querySelector('script[data-giscus]')) return;

    // Giscus 설정값이 없으면 안내 메시지 표시
    if (!GISCUS_REPO || !GISCUS_REPO_ID || !GISCUS_CATEGORY_ID) {
      return; // 아래 fallback UI가 보임
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-giscus', 'true');
    script.setAttribute('data-repo', GISCUS_REPO);
    script.setAttribute('data-repo-id', GISCUS_REPO_ID);
    script.setAttribute('data-category', GISCUS_CATEGORY);
    script.setAttribute('data-category-id', GISCUS_CATEGORY_ID);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    containerRef.current.appendChild(script);
  }, []);

  // 설정값이 아직 없으면 안내 UI 표시
  const isConfigured = GISCUS_REPO && GISCUS_REPO_ID && GISCUS_CATEGORY_ID;

  if (!isConfigured) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50 p-10 text-center">
        <div className="text-5xl mb-4">⚙️</div>
        <h3 className="text-lg font-bold text-orange-700 mb-2">게시판 설정이 필요합니다</h3>
        <p className="text-sm text-orange-600 mb-4 leading-relaxed">
          아래 안내를 따라 GitHub Discussions 연결을 완료하면<br />
          바로 자유게시판을 사용할 수 있어요.
        </p>
        <div className="text-left bg-white rounded-2xl p-6 shadow-sm text-xs text-slate-600 space-y-2 max-w-lg mx-auto">
          <p className="font-bold text-slate-800 mb-3">📋 설정 방법 (5분 소요)</p>
          <p>1. GitHub 저장소 → Settings → Features → <strong>Discussions 체크</strong></p>
          <p>2. <a href="https://github.com/apps/giscus" target="_blank" rel="noopener noreferrer" className="text-orange-500 underline font-bold">giscus GitHub App</a> 설치 → 저장소 접근 허용</p>
          <p>3. <a href="https://giscus.app/ko" target="_blank" rel="noopener noreferrer" className="text-orange-500 underline font-bold">giscus.app/ko</a> 에서 설정값 생성 후 복사</p>
          <p>4. <code className="bg-slate-100 px-1 rounded">.env.local</code> 파일에 아래 값 추가:</p>
          <div className="bg-slate-800 text-green-400 rounded-xl p-4 font-mono text-[11px] mt-2 leading-relaxed">
            <p>NEXT_PUBLIC_GISCUS_REPO=<span className="text-yellow-300">owner/repo-name</span></p>
            <p>NEXT_PUBLIC_GISCUS_REPO_ID=<span className="text-yellow-300">R_xxxxxxxxxx</span></p>
            <p>NEXT_PUBLIC_GISCUS_CATEGORY=<span className="text-yellow-300">General</span></p>
            <p>NEXT_PUBLIC_GISCUS_CATEGORY_ID=<span className="text-yellow-300">DIC_xxxxxxxxxx</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="giscus-container min-h-[300px]"
    />
  );
}
