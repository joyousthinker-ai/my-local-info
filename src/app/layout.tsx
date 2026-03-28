import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
const isAdsenseEnabled = adsenseId && adsenseId !== "나중에_입력";

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
      </head>
      <body className="min-h-full flex flex-col">
        {children}
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
