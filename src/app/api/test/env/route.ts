import { NextResponse } from 'next/server';

/**
 * 환경 변수 테스트 엔드포인트
 * 민감한 값은 마스킹하여 표시
 */
export async function GET() {
  const envVars = {
    NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID: process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID || 'NOT_SET',
    NAVER_MAPS_CLIENT_SECRET: process.env.NAVER_MAPS_CLIENT_SECRET
      ? `${process.env.NAVER_MAPS_CLIENT_SECRET.substring(0, 5)}...`
      : 'NOT_SET',
    GYEONGGI_API_KEY: process.env.GYEONGGI_API_KEY
      ? `${process.env.GYEONGGI_API_KEY.substring(0, 5)}...`
      : 'NOT_SET',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
      ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...`
      : 'NOT_SET',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'NOT_SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
  };

  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV || 'development',
    variables: envVars,
    timestamp: new Date().toISOString(),
  });
}
