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
  title: "애들레이드 생활 정보 | 행사·혜택·지원금 안내",
  description: "애들레이드(Adelaide) 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
  openGraph: {
    title: "애들레이드 생활 정보 | 행사·혜택·지원금 안내",
    description: "애들레이드(Adelaide) 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
    url: "https://my-local-info-6ul.pages.dev",
    siteName: "애들레이드 생활 정보",
    locale: "ko_KR",
    type: "website",
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
        <footer className="w-full py-8 text-center text-slate-500 text-sm bg-slate-50 border-t border-slate-100">
          <div className="flex justify-center items-center gap-3 mb-3">
            <span className="font-semibold text-slate-600">방문자 수:</span>
            {/* 무료 방문자 뱃지 (hits.seeyoufarm API) */}
            <img 
              src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fmy-local-info-6ul.pages.dev&count_bg=%23F97316&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false" 
              alt="Hits Counter" 
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
              "url": "https://my-local-info-6ul.pages.dev",
              "description": "애들레이드(Adelaide) 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보"
            })
          }}
        />
      </body>
    </html>
  );
}
