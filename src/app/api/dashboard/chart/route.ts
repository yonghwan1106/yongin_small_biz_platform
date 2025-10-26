import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, getUserFromToken } from '@/lib/auth';
import { UsersDB } from '@/lib/database';
import { fetchFootTrafficData, getRecentDates } from '@/lib/data-sources/gyeonggi-api';
import { ApiResponse } from '@/types';

interface ChartDataPoint {
  date: string;
  footTraffic: number;
}

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

    // 기간 파라미터 (기본값: 최근 7일)
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 7;

    // 최근 N일 날짜 배열
    const dates = getRecentDates(days);

    // 각 날짜별 유동인구 총합 계산 - 병렬 처리로 성능 개선
    const dataPromises = dates.map(async (date) => {
      const dayData = await fetchFootTrafficData(location, date);
      const totalFootTraffic = dayData.reduce((sum, d) => sum + d.footTraffic, 0);

      return {
        date,
        footTraffic: totalFootTraffic,
      };
    });

    const chartData = await Promise.all(dataPromises);

    return NextResponse.json({
      success: true,
      data: chartData,
    } as ApiResponse<ChartDataPoint[]>, { status: 200 });

  } catch (error) {
    console.error('Dashboard chart error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다.',
    } as ApiResponse, { status: 500 });
  }
}
