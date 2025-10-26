import axios from 'axios';
import { GyeonggiFootTrafficData, GyeonggiConsumptionData, Location } from '@/types';

const API_KEY = process.env.GYEONGGI_API_KEY;
const FOOT_TRAFFIC_API_URL = 'https://openapi.gg.go.kr/TBDASANALSGALLERYT214146';

// 경기도 유동인구 데이터 - Open API 직접 호출
// 실시간 경기도 공공데이터 API 사용
// Updated: 2025-10-25 - Fixed TypeScript error for optional timeSlot

// 인메모리 캐시 (5분 TTL)
const API_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * 유동인구 데이터 가져오기 (Open API 직접 호출)
 * @param location 위치 정보 (위도, 경도) - 현재는 용인시만 지원
 * @param date 날짜 (YYYYMMDD)
 * @param radius 반경 (미터, 기본값: 500m) - API에서는 시군구 단위 제공
 */
export async function fetchFootTrafficData(
  location: Location,
  date: string,
  radius: number = 500
): Promise<GyeonggiFootTrafficData[]> {
  try {
    console.log('🚀 Fetching foot traffic data...', { location, date });

    if (!API_KEY) {
      console.error('❌ GYEONGGI_API_KEY is not set');
      return generateMockFootTrafficData(location, date);
    }

    // 캐시 확인
    const cacheKey = 'gyeonggi_all_data';
    const cached = API_CACHE.get(cacheKey);
    let rows: any[];

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✅ Using cached data');
      rows = cached.data;
    } else {
      console.log('🌐 Fetching from API...');
      // API 호출 (페이징 - 한 번에 1000건씩)
      const response = await axios.get(FOOT_TRAFFIC_API_URL, {
        params: {
          KEY: API_KEY,
          Type: 'json',
          pIndex: 1,
          pSize: 1000, // 용인시 전체 데이터
        },
        timeout: 10000, // 10초 타임아웃
      });

      console.log('📡 API Response status:', response.status);

      // API 응답 파싱
      const apiData = response.data;

      // 경기도 API 응답 구조: { TBDASANALSGALLERYT214146: [{ head: [...], row: [...] }] }
      const dataKey = Object.keys(apiData).find(key => key.startsWith('TBDASANALSGA'));
      if (!dataKey || !apiData[dataKey] || !apiData[dataKey][1]) {
        console.warn('⚠️ No data in API response');
        return generateMockFootTrafficData(location, date);
      }

      rows = apiData[dataKey][1].row || [];
      console.log(`📊 Total API records: ${rows.length}`);

      // 캐시 저장
      API_CACHE.set(cacheKey, { data: rows, timestamp: Date.now() });
    }

    // 데이터 필터링 및 변환
    const data: GyeonggiFootTrafficData[] = [];

    for (const row of rows) {
      // 날짜 필터링 (ETL_YMD)
      const rowDate = row.ETL_YMD?.replace(/-/g, ''); // YYYY-MM-DD → YYYYMMDD
      if (rowDate !== date) continue;

      // 용인시만 필터링 (CTY_NM)
      const cityName = row.CTY_NM;
      if (!cityName || !cityName.includes('용인')) continue;

      // 시간대 (TIME_CD: 0-23)
      const hour = parseInt(row.TIME_CD);
      const timeSlot = `${String(hour).padStart(2, '0')}:00`;

      // 성별/연령대별 인구수 합산
      const footTraffic = calculateTotalPopulation(row);

      if (footTraffic > 0) {
        data.push({
          date: date,
          lat: location.lat, // API는 시군구 단위라 정확한 좌표 없음
          lng: location.lng,
          footTraffic: Math.round(footTraffic),
          timeSlot,
          ageGroup: '전체',
          gender: '전체',
        });
      }
    }

    // 시간대별로 정렬
    data.sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));

    console.log(`✅ Filtered ${data.length} records for 용인시 on ${date}`);

    // 데이터가 없으면 목업 데이터 반환
    if (data.length === 0) {
      console.warn('⚠️ No matching data found, returning mock data');
      return generateMockFootTrafficData(location, date);
    }

    return data;

  } catch (error: any) {
    console.error('❌ Error fetching foot traffic data from API:', error.message);
    // 오류 발생 시 목업 데이터 반환
    return generateMockFootTrafficData(location, date);
  }
}

/**
 * API 응답에서 성별/연령대별 인구수 합산
 */
function calculateTotalPopulation(row: any): number {
  const ageGroups = ['10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70'];
  let total = 0;

  for (const age of ageGroups) {
    const male = parseFloat(row[`M_${age}_CNT`] || 0);
    const female = parseFloat(row[`F_${age}_CNT`] || 0);
    total += male + female;
  }

  return total;
}

/**
 * 소비 데이터 가져오기
 * @param location 위치 정보
 * @param startDate 시작 날짜 (YYYYMMDD)
 * @param endDate 종료 날짜 (YYYYMMDD)
 * @param category 업종 카테고리
 */
export async function fetchConsumptionData(
  location: Location,
  startDate: string,
  endDate: string,
  category?: string
): Promise<GyeonggiConsumptionData[]> {
  try {
    console.log('💰 Fetching consumption data...', { location, startDate, endDate, category });

    // TODO: 실제 API 호출
    // const endpoint = `${BASE_URL}/ConsumptionStats`;
    // const response = await axios.get(endpoint, {
    //   params: {
    //     KEY: API_KEY,
    //     Type: 'json',
    //     startDate,
    //     endDate,
    //     lat: location.lat,
    //     lng: location.lng,
    //     category,
    //   },
    // });

    // 목업 데이터 반환
    return generateMockConsumptionData(location, startDate, endDate);

  } catch (error) {
    console.error('Error fetching consumption data:', error);
    throw new Error('소비 데이터를 가져오는데 실패했습니다.');
  }
}

/**
 * 활력 지수 계산
 * @param footTraffic 유동인구 데이터
 * @param consumption 소비 데이터
 * @param previousPeriodData 이전 기간 데이터 (성장률 계산용)
 */
export function calculateVitalityIndex(
  footTraffic: number,
  consumption: number,
  growthRate: number = 0
): number {
  // 정규화 (0-100 스케일)
  const footTrafficScore = Math.min((footTraffic / 10000) * 100, 100);
  const consumptionScore = Math.min((consumption / 50000000) * 100, 100);
  const growthScore = Math.max(Math.min(((growthRate + 20) / 40) * 100, 100), 0);

  // 가중 평균 계산
  const vitalityIndex = (
    footTrafficScore * 0.4 +
    consumptionScore * 0.4 +
    growthScore * 0.2
  );

  return Math.round(vitalityIndex * 10) / 10; // 소수점 1자리
}

/**
 * 날짜 포맷 변환 (YYYY-MM-DD → YYYYMMDD)
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 최근 N일 날짜 배열 생성
 * API 데이터: 2023년 12월 (20231205 기준)
 */
export function getRecentDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date('2023-12-05'); // 경기도 공공데이터 최신 데이터 기준

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDateForAPI(date));
  }

  return dates.reverse();
}

// ============================================
// 목업 데이터 생성 함수 (실제 API 연동 시 제거)
// ============================================

function generateMockFootTrafficData(
  location: Location,
  date: string
): GyeonggiFootTrafficData[] {
  const data: GyeonggiFootTrafficData[] = [];
  const baseTraffic = 1000 + Math.floor(Math.random() * 2000);

  // 시간대별 데이터 생성 (24시간)
  for (let hour = 0; hour < 24; hour++) {
    const timeSlot = `${String(hour).padStart(2, '0')}:00`;

    // 시간대별 유동인구 패턴 (점심/저녁 시간대 증가)
    let multiplier = 0.3;
    if (hour >= 11 && hour <= 13) multiplier = 1.5; // 점심
    if (hour >= 18 && hour <= 20) multiplier = 1.8; // 저녁
    if (hour >= 6 && hour <= 9) multiplier = 1.2; // 출근

    const footTraffic = Math.floor(baseTraffic * multiplier + Math.random() * 200);

    data.push({
      date,
      lat: location.lat,
      lng: location.lng,
      footTraffic,
      timeSlot,
      ageGroup: '30-40대',
      gender: '여성',
    });
  }

  return data;
}

function generateMockConsumptionData(
  location: Location,
  startDate: string,
  endDate: string
): GyeonggiConsumptionData[] {
  const data: GyeonggiConsumptionData[] = [];
  const categories = ['외식업', '소매업', '서비스업'];

  // 7일간 데이터 생성
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDateForAPI(date);

    categories.forEach(category => {
      const baseConsumption = 30000000 + Math.floor(Math.random() * 20000000);

      data.push({
        date: dateStr,
        lat: location.lat,
        lng: location.lng,
        consumption: baseConsumption,
        category,
      });
    });
  }

  return data;
}

/**
 * 대시보드 요약 데이터 생성
 */
export async function getDashboardSummary(location: Location) {
  try {
    // 🔄 실제 경기도 공공데이터 API의 최신 데이터 날짜 사용
    // API 데이터: 2023년 12월 (20231205, 20231217, 20231206, 20231229 등)
    const today = new Date('2023-12-05');
    const todayStr = formatDateForAPI(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateForAPI(yesterday);

    // 데이터 출처 추적 변수
    let isRealData = false;
    let dataSource: 'gyeonggi_public_data' | 'telecom_api' | 'mock' = 'mock';
    let recordCount = 0;

    // 오늘/어제 유동인구 데이터
    const todayData = await fetchFootTrafficData(location, todayStr);
    const yesterdayData = await fetchFootTrafficData(location, yesterdayStr);

    // 실제 데이터 여부 확인 (목업이 아닌 경우)
    if (todayData.length > 0 && todayData[0].ageGroup !== '30-40대') {
      // 목업 데이터는 ageGroup이 '30-40대'로 고정
      isRealData = true;
      dataSource = 'telecom_api'; // Open API 사용
      recordCount = todayData.length;
    }

    const todayTotal = todayData.reduce((sum, d) => sum + d.footTraffic, 0);
    const yesterdayTotal = yesterdayData.reduce((sum, d) => sum + d.footTraffic, 0);
    const todayChange = yesterdayTotal > 0
      ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
      : 0;

    // 주간 평균 (최근 7일) - 병렬 처리로 성능 개선
    const weekDates = getRecentDates(7);
    const weekDataPromises = weekDates.map(date => fetchFootTrafficData(location, date));
    const weekDataResults = await Promise.all(weekDataPromises);

    const weekTotal = weekDataResults.reduce((sum, dayData) =>
      sum + dayData.reduce((daySum, d) => daySum + d.footTraffic, 0), 0
    );
    const weekCount = weekDates.length;
    const weeklyAverage = Math.floor(weekTotal / weekCount);

    // 이전 주 평균 (성장률 계산) - 병렬 처리로 성능 개선
    const prevWeekDates = getRecentDates(14).slice(0, 7);
    const prevWeekDataPromises = prevWeekDates.map(date => fetchFootTrafficData(location, date));
    const prevWeekDataResults = await Promise.all(prevWeekDataPromises);

    const prevWeekTotal = prevWeekDataResults.reduce((sum, dayData) =>
      sum + dayData.reduce((daySum, d) => daySum + d.footTraffic, 0), 0
    );
    const prevWeeklyAverage = Math.floor(prevWeekTotal / 7);
    const weeklyChange = prevWeeklyAverage > 0
      ? ((weeklyAverage - prevWeeklyAverage) / prevWeeklyAverage) * 100
      : 0;

    // 월간 소비 트렌드 (최근 30일)
    const monthStart = formatDateForAPI(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
    const monthEnd = todayStr;
    const consumptionData = await fetchConsumptionData(location, monthStart, monthEnd);

    const monthlyConsumption = consumptionData.reduce((sum, d) => sum + d.consumption, 0);
    const monthlyChange = 15; // 임시 값

    return {
      todayFootTraffic: todayTotal,
      todayFootTrafficChange: todayChange,
      weeklyAverageFootTraffic: weeklyAverage,
      weeklyFootTrafficChange: weeklyChange,
      monthlyConsumptionTrend: monthlyConsumption,
      monthlyConsumptionChange: monthlyChange,
      dataSource: {
        isRealData,
        source: dataSource,
        dataPeriod: '2023년 12월',
        lastUpdated: new Date().toISOString(),
        recordCount: isRealData ? recordCount : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    throw error;
  }
}
