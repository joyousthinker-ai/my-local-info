"use client";

import { useEffect } from "react";

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
const isAdsenseEnabled = adsenseId && adsenseId !== "나중에_입력";

export default function AdBanner() {
  useEffect(() => {
    if (isAdsenseEnabled) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, []);

  if (!isAdsenseEnabled) return null;

  return (
    <div className="w-full overflow-hidden my-8 flex justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4 min-h-[100px] items-center text-slate-400 text-xs text-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <p className="absolute">ADVERTISEMENT</p>
    </div>
  );
}
