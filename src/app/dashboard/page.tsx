'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DashboardSummary, GyeonggiFootTrafficData, Location } from '@/types';
import FootTrafficChart from '@/components/FootTrafficChart';
import { SkeletonCard, SkeletonChart, SkeletonMap } from '@/components/Skeleton';

// Leaflet은 브라우저 전용 라이브러리이므로 dynamic import 사용
const LeafletHeatmap = dynamic(() => import('@/components/LeafletHeatmap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-2">지도 로딩 중...</p>
      </div>
    </div>
  ),
});

interface ChartDataPoint {
  date: string;
  footTraffic: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<GyeonggiFootTrafficData[]>([]);
  const [storeLocation, setStoreLocation] = useState<Location | null>(null);
  const [latestReport, setLatestReport] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setUserData(data.data);

          // 온보딩 완료 여부 확인
          if (!data.data.storeName) {
            router.push('/onboarding');
            return;
          }

          // 가게 위치 설정
          if (data.data.storeAddress) {
            // Naver Geocoding API를 사용해서 주소를 정확한 좌표로 변환
            console.log('📍 Converting address to coordinates:', data.data.storeAddress);

            fetch(`/api/geocode?address=${encodeURIComponent(data.data.storeAddress)}`)
              .then(res => res.json())
              .then(geocodeData => {
                if (geocodeData.success && geocodeData.data) {
                  console.log('✅ Geocoding successful:', geocodeData.data);
                  setStoreLocation(geocodeData.data);
                } else {
                  // Geocoding 실패 시 기존 좌표 사용 (fallback)
                  console.warn('⚠️ Geocoding failed, using stored coordinates');
                  if (data.data.storeLatLng) {
                    const [lat, lng] = data.data.storeLatLng.split(',').map(Number);
                    setStoreLocation({ lat, lng });
                  }
                }
              })
              .catch(err => {
                console.error('❌ Geocoding error:', err);
                // 에러 시 기존 좌표 사용 (fallback)
                if (data.data.storeLatLng) {
                  const [lat, lng] = data.data.storeLatLng.split(',').map(Number);
                  setStoreLocation({ lat, lng });
                }
              });
          } else if (data.data.storeLatLng) {
            // 주소가 없으면 기존 좌표 사용
            const [lat, lng] = data.data.storeLatLng.split(',').map(Number);
            console.log('📍 Using stored coordinates:', { lat, lng });
            setStoreLocation({ lat, lng });
          }

          // 대시보드 요약 데이터, 차트 데이터, 히트맵 데이터, 최신 보고서 가져오기
          fetchDashboardSummary(token);
          fetchChartData(token);
          fetchHeatmapData(token);
          fetchLatestReport(token);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDashboardSummary = async (token: string) => {
      try {
        const response = await fetch('/api/dashboard/summary', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setDashboardData(data.data);
        } else {
          console.error('Failed to fetch dashboard data:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    const fetchChartData = async (token: string) => {
      try {
        const response = await fetch('/api/dashboard/chart?days=7', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setChartData(data.data);
        } else {
          console.error('Failed to fetch chart data:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    const fetchHeatmapData = async (token: string) => {
      try {
        console.log('🗺️ Fetching heatmap data...');
        const response = await fetch('/api/dashboard/heatmap', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          console.log('✅ Heatmap data loaded:', data.data.length, 'records');
          setHeatmapData(data.data);
        } else {
          console.error('❌ Failed to fetch heatmap data:', data.message);
        }
      } catch (error) {
        console.error('❌ Failed to fetch heatmap data:', error);
      }
    };

    const fetchLatestReport = async (token: string) => {
      try {
        const response = await fetch('/api/reports/list', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          // 최신 보고서 (첫 번째 항목)
          setLatestReport(data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch latest report:', error);
      }
    };

    fetchUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Map & Chart Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonMap />
            <SkeletonChart />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {userData?.storeName || '내 가게'} 대시보드
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 truncate sm:whitespace-normal">
            {userData?.storeAddress || '주소 정보 없음'} · {userData?.storeCategory || '업종 정보 없음'}
          </p>
          {/* 데이터 출처 표시 */}
          {dashboardData?.dataSource && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs">
              <span className={dashboardData.dataSource.isRealData ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                {dashboardData.dataSource.isRealData ? '🟢 실제 데이터' : '🟠 추정 데이터'}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700">
                {dashboardData.dataSource.source === 'gyeonggi_public_data' && '경기도 공공데이터'}
                {dashboardData.dataSource.source === 'telecom_api' && '통신사 API'}
                {dashboardData.dataSource.source === 'mock' && '샘플 데이터'}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">{dashboardData.dataSource.dataPeriod}</span>
              {dashboardData.dataSource.recordCount && (
                <>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">{dashboardData.dataSource.recordCount.toLocaleString()}건</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* KPI Cards - 상단 가로 배치 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Card 1: 오늘의 유동인구 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">👥</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      오늘의 유동인구
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardData
                          ? dashboardData.todayFootTraffic.toLocaleString() + '명'
                          : '-'}
                      </div>
                      {dashboardData && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          dashboardData.todayFootTrafficChange >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          <span className="sr-only">전일 대비</span>
                          {dashboardData.todayFootTrafficChange >= 0 ? '↑' : '↓'}
                          {' '}{Math.abs(dashboardData.todayFootTrafficChange).toFixed(1)}%
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-500">
                  {dashboardData ? '전일 대비' : '데이터 로딩 중...'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: 주간 평균 방문 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📊</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      주간 평균 방문
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardData
                          ? dashboardData.weeklyAverageFootTraffic.toLocaleString() + '명'
                          : '-'}
                      </div>
                      {dashboardData && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          dashboardData.weeklyFootTrafficChange >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          <span className="sr-only">전주 대비</span>
                          {dashboardData.weeklyFootTrafficChange >= 0 ? '↑' : '↓'}
                          {' '}{Math.abs(dashboardData.weeklyFootTrafficChange).toFixed(1)}%
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-500">
                  {dashboardData ? '전주 대비' : '데이터 로딩 중...'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: 월간 소비 트렌드 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">💰</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      월간 소비 트렌드
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardData
                          ? '₩' + (dashboardData.monthlyConsumptionTrend / 100000000).toFixed(1) + '억'
                          : '-'}
                      </div>
                      {dashboardData && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          dashboardData.monthlyConsumptionChange >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          <span className="sr-only">전월 대비</span>
                          {dashboardData.monthlyConsumptionChange >= 0 ? '↑' : '↓'}
                          {' '}{Math.abs(dashboardData.monthlyConsumptionChange).toFixed(1)}%
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-500">
                  {dashboardData ? '전월 대비' : '데이터 로딩 중...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Heatmap Section - 히트맵 크게 */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              🗺️ 상권 활력 지수 히트맵
            </h2>
            <button
              onClick={() => {
                const elem = document.getElementById('heatmap-container');
                if (elem) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    elem.requestFullscreen();
                  }
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>전체화면</span>
            </button>
          </div>
          <div id="heatmap-container" className="h-[600px]">
            {storeLocation ? (
              <LeafletHeatmap center={storeLocation} heatmapData={heatmapData} />
            ) : (
              <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">위치 정보 로딩 중...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            📈 유동인구 추이 (최근 7일)
          </h2>
          <div className="h-64 sm:h-80">
            {chartData.length > 0 ? (
              <FootTrafficChart data={chartData} />
            ) : (
              <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">차트 데이터 로딩 중...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="text-3xl sm:text-4xl">🤖</div>
            </div>
            <div className="ml-3 sm:ml-4 flex-1">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                이번 주 AI 인사이트
              </h2>
              {latestReport ? (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                      생성일: {new Date(latestReport.generatedAt).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                      최신 보고서
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap line-clamp-6">
                      {latestReport.content.substring(0, 300)}
                      {latestReport.content.length > 300 && '...'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">
                    아직 AI 보고서가 생성되지 않았습니다. 매주 월요일 새벽 4시에
                    맞춤형 AI 보고서를 생성해드립니다.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>다음 보고서 예정:</strong> 익주 월요일
                  </p>
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={() => router.push('/reports')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  {latestReport ? '전체 보고서 보기 →' : '보고서 목록 보기 →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Info Banner */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 sm:p-5">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                📡 통신사 실시간 데이터 연동 완료
              </h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs sm:text-sm text-gray-700 font-medium mb-2">
                    🔗 <strong>데이터 출처:</strong> KT · SK텔레콤 · LG U+ 통신사 집계 데이터
                  </p>
                  <p className="text-xs text-gray-600">
                    경기도 공공데이터 포털의 생활이동인구 데이터는 국내 3대 통신사(KT, SK, LG)의
                    <strong className="text-blue-600"> 실제 이동통신 기지국 데이터를 기반</strong>으로 집계됩니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white rounded p-2 border border-green-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">용인시 39개 행정동</p>
                        <p className="text-xs text-gray-600">29,016건 데이터</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-green-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏰</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">시간대별 분석</p>
                        <p className="text-xs text-gray-600">24시간 단위 집계</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-green-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">OpenStreetMap 시각화</p>
                        <p className="text-xs text-gray-600">히트맵 표시</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-green-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Claude AI 분석</p>
                        <p className="text-xs text-gray-600">주간 보고서 생성</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-xs text-yellow-800">
                    <strong>💡 데이터 갱신:</strong> 매월 1일 자동 업데이트 예정 (현재: 2025년 8월 데이터)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
