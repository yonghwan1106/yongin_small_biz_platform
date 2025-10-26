import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ApiResponse, Location } from '@/types';

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_MAPS_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_ADDRESS',
        message: '주소를 입력해주세요.',
      } as ApiResponse, { status: 400 });
    }

    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      console.error('Naver Maps credentials not configured');
      return NextResponse.json({
        success: false,
        error: 'API_NOT_CONFIGURED',
        message: 'Naver Maps API 설정이 필요합니다.',
      } as ApiResponse, { status: 500 });
    }

    // Naver Geocoding API 호출
    const response = await axios.get('https://maps.apigw.ntruss.com/map-geocode/v2/geocode', {
      params: {
        query: address,
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET,
      },
    });

    if (response.data.status === 'OK' && response.data.addresses && response.data.addresses.length > 0) {
      const result = response.data.addresses[0];
      const location: Location = {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
      };

      return NextResponse.json({
        success: true,
        data: location,
      } as ApiResponse<Location>, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      error: 'NO_RESULTS',
      message: '주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.',
    } as ApiResponse, { status: 404 });

  } catch (error: any) {
    console.error('Geocoding error:', error.response?.data || error.message);
    return NextResponse.json({
      success: false,
      error: 'GEOCODING_ERROR',
      message: '주소 변환 중 오류가 발생했습니다.',
    } as ApiResponse, { status: 500 });
  }
}
