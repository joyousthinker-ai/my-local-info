"use client";

const coupangPartnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID;
const isCoupangEnabled = coupangPartnerId && coupangPartnerId !== "나중에_입력";

export default function CoupangBanner() {
  if (!isCoupangEnabled) return null;

  return (
    <div className="w-full my-6 flex justify-center overflow-hidden">
      <div className="bg-slate-50 rounded-2xl border border-dashed border-sky-200 p-6 w-full text-center relative">
        <span className="absolute top-2 right-3 text-[10px] text-slate-400 font-medium">COUPANG PARTNERS</span>
        
        {/* 쿠팡 파트너스 배너 스크립트가 들어갈 자리입니다. */}
        <div className="min-h-[120px] flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-xl">📦</div>
          <div>
            <p className="text-sm font-bold text-slate-800">쿠팡 추천 상품</p>
            <p className="text-xs text-slate-500 mt-1">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
          </div>
          
          {/* 실제 배너 코드를 넣을 때는 여기에 <script> 태그나 <iframe>을 배치합니다. */}
        </div>
      </div>
    </div>
  );
}
