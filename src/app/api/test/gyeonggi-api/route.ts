import { NextRequest, NextResponse } from 'next/server';
import { fetchFootTrafficData, formatDateForAPI } from '@/lib/data-sources/gyeonggi-api';

/**
 * API 테스트 엔드포인트
 * 경기도 Open API 연동 테스트
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '20250815'; // 기본값: 2025-08-15

    console.log('🧪 Testing Gyeonggi API with date:', date);

    // 용인시 중심 좌표 (대략적인 위치)
    const location = {
      lat: 37.2747,
      lng: 127.0449,
    };

    // API 호출
    const data = await fetchFootTrafficData(location, date);

    return NextResponse.json({
      success: true,
      message: 'API test successful',
      data: {
        totalRecords: data.length,
        date: date,
        location: location,
        sampleData: data.slice(0, 5), // 처음 5개만 반환
        timeSlots: data.map(d => d.timeSlot),
        totalFootTraffic: data.reduce((sum, d) => sum + d.footTraffic, 0),
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ API test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'API_TEST_FAILED',
      message: error.message,
    }, { status: 500 });
  }
}
