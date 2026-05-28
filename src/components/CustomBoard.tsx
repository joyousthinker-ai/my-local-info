'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

type CommentItem = {
  id: string;
  nickname: string;
  content: string;
  rating: number;
  pathname: string;
  created_at: string;
};

export default function CustomBoard() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 입력 폼 상태
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  // 삭제용 상태
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/board';

  // 1. 댓글 목록 조회 함수
  const fetchComments = useCallback(async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('pathname', pathname)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('댓글을 불러오는 중 오류 발생:', err);
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (supabase) {
      fetchComments();
    }
  }, [fetchComments]);

  // 2. 댓글 등록 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (!nickname.trim()) {
      alert('이름(닉네임)을 입력해 주세요.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      alert('삭제용 비밀번호를 4자리 이상 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      alert('이야기나 리뷰 내용을 작성해 주세요.');
      return;
    }

    try {
      setSubmitLoading(true);
      const { error } = await supabase.from('comments').insert([
        {
          nickname: nickname.trim(),
          password: password.trim(), // 방명록 수준의 간단 검증을 위해 해싱 없이 단독 저장합니다.
          content: content.trim(),
          rating,
          pathname,
        },
      ]);

      if (error) throw error;

      // 폼 초기화 및 새로고침
      setNickname('');
      setPassword('');
      setContent('');
      setRating(5);
      fetchComments();
      alert('리뷰가 성공적으로 등록되었습니다! 😊');
    } catch (err) {
      console.error('글 등록 오류:', err);
      alert('글 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. 댓글 삭제 함수
  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!deletePassword.trim()) {
      alert('삭제 비밀번호를 입력해 주세요.');
      return;
    }

    try {
      const { error, count } = await supabase
        .from('comments')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('password', deletePassword.trim());

      if (error) throw error;

      if (count === 0) {
        alert('비밀번호가 일치하지 않습니다. 다시 확인해 주세요!');
      } else {
        alert('리뷰가 안전하게 삭제되었습니다.');
        setDeleteTargetId(null);
        setDeletePassword('');
        fetchComments();
      }
    } catch (err) {
      console.error('글 삭제 오류:', err);
      alert('댓글 삭제 도중 오류가 발생했습니다.');
    }
  };

  // 4. 데이터베이스가 연결되지 않았을 때의 간단한 예외 처리
  if (!supabase) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-3xl border border-slate-100">
        게시판 데이터베이스 연결 설정이 필요합니다. 관리자에게 문의해 주세요.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 댓글/리뷰 작성 폼 */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="text-xl">✍️</span> 리뷰 & 의견 남기기
        </h3>

        {/* 닉네임, 비밀번호, 별점 한 줄 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">이름 (닉네임)</label>
            <input
              type="text"
              placeholder="예: 호주새댁"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all font-medium"
              maxLength={15}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">비밀번호 (4자리 이상)</label>
            <input
              type="password"
              placeholder="글 삭제시 사용됩니다"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all font-medium"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">추천 별점</label>
            <div className="flex items-center space-x-1.5 h-[46px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl transform hover:scale-125 transition-transform"
                >
                  <span className={star <= rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
                </button>
              ))}
              <span className="text-sm font-bold text-slate-400 ml-2">{rating}점 / 5점</span>
            </div>
          </div>
        </div>

        {/* 리뷰 작성 텍스트창 */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">이야기 내용</label>
          <textarea
            placeholder="애들레이드에서의 일상, 질문, 장소에 대한 따뜻하고 소중한 의견을 공유해 주세요! (욕설 및 불법 광고는 제재될 수 있습니다.)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all font-medium leading-relaxed resize-none"
            maxLength={1000}
          />
        </div>

        {/* 등록 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitLoading}
            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-violet-200/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitLoading ? '등록 중...' : '소중한 글 등록하기 🚀'}
          </button>
        </div>
      </form>

      {/* 댓글/리뷰 목록 표시 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center text-sm">💬</span>
            전체 한줄 이야기 ({comments.length}개)
          </h3>
          <button 
            onClick={fetchComments}
            className="text-xs font-bold text-slate-400 hover:text-violet-500 transition-all flex items-center gap-1 cursor-pointer"
          >
            🔄 실시간 새로고침
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold pt-2">댓글을 신나게 불러오는 중...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl">
            <span className="text-5xl block mb-4">🏝️</span>
            <p className="text-sm font-bold text-slate-700 mb-1">아직 작성된 이야기가 없네요!</p>
            <p className="text-xs text-slate-400">첫 번째 소중한 이야기의 주인공이 되어 보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative group/card">
                
                {/* 닉네임, 별점, 날짜, 삭제버튼 */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-black text-slate-800">{item.nickname}</span>
                    <span className="text-xs text-amber-400 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                      ★ {item.rating}점
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(item.created_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    
                    {/* 개별 삭제 버튼 */}
                    <button
                      onClick={() => {
                        setDeleteTargetId(deleteTargetId === item.id ? null : item.id);
                        setDeletePassword('');
                      }}
                      className="text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover/card:opacity-100 focus:opacity-100 p-1 cursor-pointer text-sm"
                      title="댓글 삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* 댓글 본문 내용 */}
                <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {item.content}
                </p>

                {/* 삭제용 패스워드 입력창 활성화 시 */}
                {deleteTargetId === item.id && (
                  <div className="mt-4 bg-red-50/50 border border-red-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-down">
                    <div className="text-left">
                      <p className="text-[11px] font-bold text-red-700">이 글의 작성 비밀번호를 입력해 주세요.</p>
                      <p className="text-[10px] text-red-500">한 번 지워진 소중한 글은 복구할 수 없습니다.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="password"
                        placeholder="비밀번호"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="bg-white border border-red-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-500 font-mono w-28 text-center"
                        maxLength={10}
                      />
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                      >
                        삭제 승인
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(null)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
