'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { analyzeEnglish, CoachResult } from '@/lib/gemini-coach';

interface HistoryItem {
  id: string;
  timestamp: number;
  inputType: 'image' | 'text';
  previewText: string;
  result: CoachResult;
}

export default function EnglishCoachPage() {
  const [activeTab, setActiveTab] = useState<'paste' | 'camera' | 'text'>('paste');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 로컬 스토리지에서 과거 기록 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('english_coach_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('히스토리 로드 실패', e);
    }
  }, []);

  // 전역 클립보드 붙여넣기(Ctrl+V / Cmd+V) 감지
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // 이미지 파일 처리 및 자동 분석
  const processImageFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setActiveTab('paste');
      // 자동으로 바로 분석 시작
      await runAnalysis({ imageBase64: base64, mimeType: file.type || 'image/jpeg' });
    };
    reader.readAsDataURL(file);
  };

  // 분석 실행 함수
  const runAnalysis = async (params: { text?: string; imageBase64?: string; mimeType?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const coachResult = await analyzeEnglish(params);
      setResult(coachResult);

      // 히스토리 저장
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        inputType: params.imageBase64 ? 'image' : 'text',
        previewText: coachResult.correctedText || coachResult.extractedText || '영어 문장 교정',
        result: coachResult,
      };

      const updatedHistory = [newItem, ...history.slice(0, 19)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('english_coach_history', JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn('히스토리 저장 실패', e);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 텍스트 제출
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('검사할 영어 문장을 입력해주세요.');
      return;
    }
    await runAnalysis({ text: inputText.trim() });
  };

  // 클립보드 복사
  const copyToClipboard = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (e) {
      console.error('복사 실패', e);
    }
  };

  // 원어민 발음 듣기 (Web Speech API)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('현재 브라우저에서는 음성 듣기를 지원하지 않습니다.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 초보자가 듣기 편하게 살짝 여유있는 속도

    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // 히스토리 삭제
  const clearHistory = () => {
    if (confirm('모든 이전 학습 기록을 삭제하시겠습니까?')) {
      setHistory([]);
      localStorage.removeItem('english_coach_history');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-slate-50 to-white text-slate-900 pb-20">
      {/* 헤더 네비게이션 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl transform group-hover:scale-110 transition-transform">🔍</span>
            <div>
              <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 tracking-tight">
                AI 영어 렌즈 & 코치
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-bold bg-orange-100 text-orange-700 rounded-full">
                Gemini Vision
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center gap-1.5"
            >
              <span>🕒</span>
              <span>최근 기록 ({history.length})</span>
            </button>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* 앱 소개 히어로 */}
        <div className="text-center space-y-2 py-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            캡처나 사진 한 번으로, <span className="text-orange-600">완벽한 영어 교정!</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            문자나 메일을 쓰다가 캡처해서 붙여넣거나, 카메라로 찍어보세요.
            <br className="hidden sm:inline" /> 제미나이 AI가 틀린 이유와 원어민 표현까지 알기 쉽게 알려드립니다.
          </p>
        </div>

        {/* 3가지 입력 탭 */}
        <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-xl shadow-orange-500/5 border border-orange-100">
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-4 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('paste')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-orange-500'
              }`}
            >
              <span>🖼️</span>
              <span>캡처/사진 (Ctrl+V)</span>
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'camera'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-orange-500'
              }`}
            >
              <span>📸</span>
              <span>카메라 촬영</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'text'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-orange-500'
              }`}
            >
              <span>✍️</span>
              <span>직접 입력</span>
            </button>
          </div>

          {/* 숨김 파일 인풋 */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processImageFile(file);
            }}
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processImageFile(file);
            }}
          />

          {/* 1. 캡처/사진 붙여넣기 탭 */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    processImageFile(file);
                  }
                }}
                className="border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50/80 rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px]"
              >
                {selectedImage ? (
                  <div className="space-y-3">
                    <img
                      src={selectedImage}
                      alt="선택된 이미지"
                      className="max-h-48 rounded-xl mx-auto shadow-md object-contain border border-orange-200"
                    />
                    <p className="text-xs font-bold text-orange-600">
                      클릭하여 다른 이미지로 변경하기
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
                      📋
                    </div>
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1">
                      스크린샷 캡처 후 <span className="text-orange-600">Ctrl + V</span> (맥은 Cmd+V)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
                      여기를 클릭해 사진을 업로드하거나, 화면 어디서든 캡처한 이미지를 붙여넣어 보세요!
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 2. 카메라 촬영 탭 */}
          {activeTab === 'camera' && (
            <div className="text-center p-6 sm:p-10 bg-orange-50/40 rounded-2xl border-2 border-dashed border-orange-300">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                📸
              </div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1">
                카메라로 영어 글 촬영하기
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5">
                손글씨 노트, 컴퓨터 화면의 문자/메일, 책이나 안내문을 카메라로 바로 찍어보세요.
              </p>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all text-sm sm:text-base inline-flex items-center gap-2"
              >
                <span>📷</span>
                <span>카메라 켜기 및 촬영</span>
              </button>
            </div>
          )}

          {/* 3. 직접 입력 탭 */}
          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="검사받고 싶은 영어 문장을 여기에 자유롭게 적어보세요... (예: I am looking forward to meet you yesterday.)"
                  rows={4}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>✨</span>
                <span>AI 문법 검사 & 피드백 시작하기</span>
              </button>
            </form>
          )}
        </div>

        {/* 에러 메시지 알림 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-3 animate-fade-in">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold">안내</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-lg border border-orange-100 space-y-4">
            <div className="inline-block animate-spin text-4xl mb-2">⚡</div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800">
              제미나이 AI가 문장과 문법을 꼼꼼하게 분석하고 있어요!
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              원문 인식 ➔ 문법 교정 ➔ 틀린 이유 분석 ➔ 맞춤 학습 팁 생성 중...
            </p>
            <div className="w-48 h-1.5 bg-orange-100 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-orange-500 to-amber-400 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* 과거 기록 모달/서랍 */}
        {showHistory && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>🕒</span>
                <span>최근 학습 및 교정 기록</span>
              </h3>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:underline"
                  >
                    전체 삭제
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  닫기 ✕
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                아직 저장된 교정 기록이 없습니다.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setResult(item.result);
                      setShowHistory(false);
                    }}
                    className="p-3 bg-slate-50 hover:bg-orange-50/60 rounded-xl border border-slate-100 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1 overflow-hidden pr-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{item.inputType === 'image' ? '🖼️ 이미지' : '✍️ 텍스트'}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-orange-600">
                        {item.previewText}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-orange-500 whitespace-nowrap">
                      다시 보기 →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🌟 5단계 스마트 피드백 결과 화면 */}
        {result && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. 교정 총평 & 완성본 히어로 카드 */}
            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                    ✨ AI 원어민 완벽 교정본
                  </span>
                  {result.score && (
                    <span className="px-3 py-1 bg-amber-300 text-slate-900 rounded-full text-xs font-black">
                      자연스러움 {result.score}점
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(result.correctedText)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    title="원어민 발음 듣기"
                  >
                    <span>{isPlayingAudio ? '🔊 재생 중...' : '🔊 발음 듣기'}</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.correctedText, 'main')}
                    className="px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1"
                  >
                    <span>{copiedSection === 'main' ? '✓ 복사완료!' : '📋 복사하기'}</span>
                  </button>
                </div>
              </div>

              {/* 교정 문장 */}
              <div className="space-y-2">
                <p className="text-xl sm:text-2xl font-black leading-relaxed tracking-tight">
                  &ldquo;{result.correctedText}&rdquo;
                </p>
                {result.summaryFeedback && (
                  <p className="text-orange-100 text-xs sm:text-sm font-medium pt-1">
                    💡 {result.summaryFeedback}
                  </p>
                )}
              </div>
            </div>

            {/* 2. 인식된 원문 확인 카드 */}
            {result.extractedText && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span>🔍</span> 인식된 원문 (Before)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.extractedText, 'extracted')}
                    className="text-orange-600 hover:underline"
                  >
                    {copiedSection === 'extracted' ? '복사됨!' : '원문 복사'}
                  </button>
                </div>
                <p className="text-sm sm:text-base text-slate-700 font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {result.extractedText}
                </p>
              </div>
            )}

            {/* 3. 어디가 왜 틀렸을까요? (1:1 비교 분석) */}
            {result.mistakes && result.mistakes.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                  <span>🛠️</span>
                  <span>어디가 왜 틀렸을까요? (초보자 맞춤 설명)</span>
                </h3>
                <div className="grid gap-3">
                  {result.mistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-lg line-through text-xs sm:text-sm">
                          {mistake.original}
                        </span>
                        <span className="text-slate-400 font-bold">➔</span>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs sm:text-sm">
                          {mistake.corrected}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-1">
                        💡 {mistake.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 상황별 추천 표현 (캐주얼 vs 비즈니스) */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* 캐주얼 */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-1">
                    <span>📱</span> 친구/문자/SNS (Casual)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.casualAlternative, 'casual')}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600"
                  >
                    {copiedSection === 'casual' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {result.casualAlternative || result.correctedText}
                </p>
              </div>

              {/* 비즈니스 */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg flex items-center gap-1">
                    <span>💼</span> 격식있는 메일/업무 (Formal)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.formalAlternative, 'formal')}
                    className="text-xs font-bold text-slate-500 hover:text-purple-600"
                  >
                    {copiedSection === 'formal' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {result.formalAlternative || result.correctedText}
                </p>
              </div>
            </div>

            {/* 5. 앞으로의 맞춤 학습 팁 */}
            {result.studyTips && result.studyTips.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 space-y-3">
                <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
                  <span>🎓</span>
                  <span>앞으로 이것만 기억하세요! (맞춤 학습 꿀팁)</span>
                </h3>
                <ul className="space-y-2">
                  {result.studyTips.map((tip, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-amber-950 flex items-start gap-2">
                      <span className="font-bold text-amber-600">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
