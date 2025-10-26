import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, getUserFromToken } from '@/lib/auth';
import { UsersDB } from '@/lib/database';
import { getDashboardSummary } from '@/lib/data-sources/gyeonggi-api';
import { ApiResponse, DashboardSummary } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
      } as ApiResponse, { status: 401 });
    }

    const tokenUser = getUserFromToken(token);
    if (!tokenUser) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_TOKEN',
        message: '유효하지 않은 토큰입니다.',
      } as ApiResponse, { status: 401 });
    }

    // 사용자 정보 조회
    const user = await UsersDB.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다.',
      } as ApiResponse, { status: 404 });
    }

    // 가게 위치 정보 확인
    if (!user.storeLatLng) {
      return NextResponse.json({
        success: false,
        error: 'NO_LOCATION',
        message: '가게 위치 정보가 없습니다. 온보딩을 완료해주세요.',
      } as ApiResponse, { status: 400 });
    }

    // 위치 파싱
    const [lat, lng] = user.storeLatLng.split(',').map(Number);
    const location = { lat, lng };

    // 대시보드 요약 데이터 가져오기
    const summary = await getDashboardSummary(location);

    return NextResponse.json({
      success: true,
      data: summary,
    } as ApiResponse<DashboardSummary>, { status: 200 });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다.',
    } as ApiResponse, { status: 500 });
  }
}
