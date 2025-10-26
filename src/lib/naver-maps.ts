import axios from 'axios';
import { Location } from '@/types';

const NAVER_MAPS_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
const NAVER_MAPS_CLIENT_SECRET = process.env.NAVER_MAPS_CLIENT_SECRET;

/**
 * Naver Maps Geocoding API를 사용하여 주소를 좌표로 변환
 * @param address 변환할 주소
 * @returns 위도, 경도 객체
 */
export async function geocodeAddress(address: string): Promise<Location | null> {
  try {
    // Naver Geocoding API 호출
    // https://api.naver.com/v1/map/geocode
    const response = await axios.get('https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode', {
      params: {
        query: address,
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_MAPS_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_MAPS_CLIENT_SECRET,
      },
    });

    if (response.data.status === 'OK' && response.data.addresses.length > 0) {
      const result = response.data.addresses[0];
      return {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
      };
    }

    console.error('Geocoding failed: No results found');
    return null;

  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * 좌표를 주소로 변환 (Reverse Geocoding)
 * @param location 위도, 경도
 * @returns 주소 문자열
 */
export async function reverseGeocode(location: Location): Promise<string | null> {
  try {
    const response = await axios.get('https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc', {
      params: {
        coords: `${location.lng},${location.lat}`,
        output: 'json',
        orders: 'roadaddr',
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_MAPS_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_MAPS_CLIENT_SECRET,
      },
    });

    if (response.data.status.code === 0 && response.data.results.length > 0) {
      const result = response.data.results[0];
      const region = result.region;
      const land = result.land;

      // 도로명 주소 구성
      let address = '';
      if (region) {
        address += `${region.area1.name} ${region.area2.name} ${region.area3.name}`;
      }
      if (land && land.addition0) {
        address += ` ${land.addition0.value}`;
      }

      return address;
    }

    console.error('Reverse geocoding failed');
    return null;

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
