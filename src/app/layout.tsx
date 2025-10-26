import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "용인 소상공인 활력 지수",
  description: "데이터 기반 스마트 경영을 위한 상권 분석 플랫폼",
  keywords: ["용인", "소상공인", "상권 분석", "유동인구", "AI 보고서"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const naverMapsClientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID || '';

  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <Script
          strategy="beforeInteractive"
          src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapsClientId}`}
        />
        <ErrorBoundary>
          <ToastProvider>
            <Navigation />
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
