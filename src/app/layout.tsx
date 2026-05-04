import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
const isAdsenseEnabled = adsenseId && adsenseId !== "나중에_입력";

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const isGaEnabled = gaId && gaId !== "나중에_입력";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "애들레이드 생활 정보 | 호주 남호주 교민·유학생·워홀 필수 가이드",
  description: "애들레이드(Adelaide) 교민, 유학생, 워홀러를 위한 이민 정착, 운전면허, 의료, 학교, 렌트, 여행 생활 정보. 남호주(South Australia) 최신 행사·혜택·지원금을 매일 업데이트합니다.",
  keywords: [
    "애들레이드", "Adelaide", "남호주", "South Australia", "애들레이드 생활",
    "애들레이드 정보", "애들레이드 이민", "애들레이드 유학", "호주 워홀", "호주 이민",
    "호주 정착", "애들레이드 렌트", "애들레이드 학교", "호주 Medicare", "남호주 운전면허",
    "바로사밸리", "캥거루아일랜드", "애들레이드 행사", "호주 생활비", "호주 필수앱",
    "Adelaide living", "South Australia guide", "Adelaide expat", "Korean Adelaide"
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://my-local-info-6ul.pages.dev",
  },
  openGraph: {
    title: "애들레이드 생활 정보 | 호주 남호주 교민·유학생·워홀 필수 가이드",
    description: "애들레이드(Adelaide) 교민, 유학생, 워홀러를 위한 이민 정착, 운전면허, 의료, 학교, 렌트, 여행 생활 정보. 남호주 최신 행사·혜택을 매일 업데이트.",
    url: "https://my-local-info-6ul.pages.dev",
    siteName: "애들레이드 생활 정보",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "애들레이드 생활 정보 | 남호주 교민·유학생 필수 가이드",
    description: "애들레이드 이민·정착·여행 실전 가이드. 남호주 생활 정보를 매일 업데이트합니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {isAdsenseEnabled && (
          <Script
             async
             src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
             crossOrigin="anonymous"
             strategy="afterInteractive"
          />
        )}
        {isGaEnabled && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <footer className="w-full py-6 text-center text-slate-500 text-sm bg-slate-50 border-t border-slate-100">
          <div className="flex justify-center items-center gap-3 mb-2">
            <img
              src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fmy-local-info-6ul.pages.dev&count_bg=%23F97316&title_bg=%23334155&icon=&icon_color=%23E7E7E7&title=Visitors&edge_flat=true"
              alt="방문자 수"
              className="h-5"
            />
          </div>
          <p>© {new Date().getFullYear()} 애들레이드 생활 정보. All rights reserved.</p>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "애들레이드 생활 정보",
              "alternateName": ["Adelaide Local Info", "남호주 생활 정보", "사우스오스트레일리아 정보", "애들레이드 축제 정보"],
              "url": "https://my-local-info-6ul.pages.dev",
              "description": "애들레이드(Adelaide) 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보"
            })
          }}
        />
      </body>
    </html>
  );
}
