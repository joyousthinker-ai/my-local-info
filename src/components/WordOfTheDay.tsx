"use client";

import { useState, useEffect } from 'react';

const WORDS_LIST = [
  "lease", "bond", "inspection", "suburb", "mortgage", 
  "pharmacy", "appointment", "grocery", "medicare", "visa",
  "resume", "interview", "allowance", "breeze", "mate",
  "barbecue", "sunscreen", "council", "penalty", "refund"
];

interface DictionaryResponse {
  word: string;
  phonetic?: string;
  phonetics: { audio?: string; text?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

export default function WordOfTheDay() {
  const [wordData, setWordData] = useState<DictionaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Get the word of the day based on the day of the year
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 
      1000 / 60 / 60 / 24
    );
    const selectedWord = WORDS_LIST[dayOfYear % WORDS_LIST.length];

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedWord}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: DictionaryResponse[]) => {
        setWordData(data[0]);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const playAudio = () => {
    if (!wordData) return;
    const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  };

  if (error) {
    return (
      <div className="bg-slate-100 rounded-3xl p-6 text-slate-500 text-center text-sm shadow-sm mb-8 border border-slate-200">
        <span className="text-xl mb-2 block">🔌</span>
        오늘의 영단어를 불러올 수 없습니다.<br/>
        나중에 다시 시도해 주세요.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200/50 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-black bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg uppercase tracking-widest flex items-center">
          <span className="mr-1 text-sm">📖</span> 오늘의 호주 생활 영단어
        </span>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-white/20 rounded w-1/2"></div>
          <div className="h-4 bg-white/20 rounded w-full"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
        </div>
      ) : wordData ? (
        <div className="relative z-10">
          <div className="flex items-end gap-3 mb-2">
            <h4 className="text-3xl font-black capitalize tracking-tight">{wordData.word}</h4>
            {wordData.phonetic && (
              <span className="text-white/70 text-sm font-medium pb-1">{wordData.phonetic}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            {wordData.phonetics.some(p => p.audio) && (
              <button 
                onClick={playAudio}
                className="inline-flex items-center justify-center p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                title="발음 듣기"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                </svg>
              </button>
            )}
            <span className="text-xs font-bold bg-indigo-800/50 px-2 py-0.5 rounded text-indigo-100">
              {wordData.meanings[0]?.partOfSpeech}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              {wordData.meanings[0]?.definitions[0]?.definition}
            </p>
            {wordData.meanings[0]?.definitions[0]?.example && (
              <p className="text-xs text-indigo-100/80 italic border-l-2 border-indigo-300 pl-3 py-1">
                "{wordData.meanings[0]?.definitions[0]?.example}"
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
