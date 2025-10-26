'use client';

import { useEffect, useRef, useState } from 'react';
import { Location, GyeonggiFootTrafficData } from '@/types';

interface NaverMapProps {
  center: Location;
  heatmapData?: GyeonggiFootTrafficData[];
}

declare global {
  interface Window {
    naver: any;
  }
}

export default function NaverMap({ center, heatmapData }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlaysRef = useRef<any[]>([]);

  console.log('[NaverMap] Render:', { center, heatmapDataLength: heatmapData?.length, isLoaded, hasMap: !!mapInstanceRef.current });

  // Naver Maps API 스크립트 로드
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
    console.log('[NaverMap] Script load effect, clientId:', clientId);

    if (!clientId) {
      const errorMsg = 'Naver Maps Client ID가 설정되지 않았습니다.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // 이미 로드되었는지 확인
    if (typeof window !== 'undefined' && window.naver && window.naver.maps) {
      console.log('[NaverMap] Already loaded');
      setIsLoaded(true);
      return;
    }

    // 이미 스크립트 태그가 있는지 확인
    const existingScript = document.querySelector('script[src*="openapi.map.naver.com"]');
    if (existingScript) {
      // 스크립트가 로드될 때까지 대기
      const checkInterval = setInterval(() => {
        if (window.naver && window.naver.maps) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }

    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = (error) => {
      console.error('Naver Maps 스크립트 로드 실패', error);
    };
    document.head.appendChild(script);

    return () => {
      // cleanup: 스크립트 제거는 하지 않음 (다른 컴포넌트에서 사용 가능)
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    console.log('[NaverMap] Map init effect:', { isLoaded, hasMapRef: !!mapRef.current, hasMap: !!mapInstanceRef.current });

    if (!isLoaded) {
      console.log('[NaverMap] Not loaded yet');
      return;
    }

    if (!mapRef.current) {
      console.log('[NaverMap] MapRef not ready');
      return;
    }

    if (mapInstanceRef.current) {
      console.log('[NaverMap] Map already exists, updating center');
      // 지도가 이미 존재하면 중심만 업데이트
      const naver = window.naver;
      if (naver && naver.maps) {
        mapInstanceRef.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
      }
      return;
    }

    const naver = window.naver;
    if (!naver || !naver.maps) {
      console.error('[NaverMap] Naver maps not available');
      return;
    }

    console.log('[NaverMap] Creating map...', center);
    const mapOptions = {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom: 15,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    };

    try {
      const newMap = new naver.maps.Map(mapRef.current, mapOptions);
      console.log('[NaverMap] Map created successfully', newMap);

      // 지도 크기 재조정 (중요!)
      setTimeout(() => {
        if (newMap) {
          naver.maps.Event.trigger(newMap, 'resize');
          newMap.setCenter(new naver.maps.LatLng(center.lat, center.lng));
          console.log('[NaverMap] Map resized and centered');
        }
      }, 100);

      mapInstanceRef.current = newMap;

      // 중심 마커 추가
      new naver.maps.Marker({
        position: new naver.maps.LatLng(center.lat, center.lng),
        map: newMap,
        title: '내 가게',
        icon: {
          content: `
            <div style="
              background: #3b82f6;
              color: white;
              padding: 8px 12px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              📍 내 가게
            </div>
          `,
          anchor: new naver.maps.Point(50, 50),
        },
      });
      console.log('[NaverMap] Store marker added');
    } catch (err) {
      console.error('[NaverMap] Failed to create map:', err);
      setError('지도 생성 실패: ' + err);
    }
  }, [isLoaded, center]);

  // 히트맵 데이터 시각화
  useEffect(() => {
    if (!mapInstanceRef.current || !heatmapData || heatmapData.length === 0) {
      return;
    }

    const naver = window.naver;

    // 기존 오버레이 제거
    overlaysRef.current.forEach(overlay => {
      if (overlay.setMap) {
        overlay.setMap(null);
      }
    });
    overlaysRef.current = [];

    // 유동인구 데이터를 기반으로 원형 오버레이 생성
    // 시간대별 합계 계산
    const timeSlotData = new Map<string, number>();
    heatmapData.forEach(d => {
      const timeSlot = d.timeSlot || '';
      const current = timeSlotData.get(timeSlot) || 0;
      timeSlotData.set(timeSlot, current + d.footTraffic);
    });

    // 가장 많은 유동인구를 가진 시간대들만 표시
    const sortedSlots = Array.from(timeSlotData.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // 상위 10개 시간대만 표시

    sortedSlots.forEach(([timeSlot, traffic]) => {
      // 반경 계산 (유동인구에 비례)
      const radius = Math.min(50 + (traffic / 50), 200);

      // 투명도 계산
      const maxTraffic = sortedSlots[0][1];
      const opacity = 0.2 + (traffic / maxTraffic) * 0.3;

      // 랜덤한 위치 (중심 주변 500m 이내)
      const offsetLat = (Math.random() - 0.5) * 0.005;
      const offsetLng = (Math.random() - 0.5) * 0.005;

      const circle = new naver.maps.Circle({
        map: mapInstanceRef.current,
        center: new naver.maps.LatLng(center.lat + offsetLat, center.lng + offsetLng),
        radius: radius,
        fillColor: '#ff0000',
        fillOpacity: opacity,
        strokeWeight: 0,
      });

      // 정보 마커 추가
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(center.lat + offsetLat, center.lng + offsetLng),
        map: mapInstanceRef.current,
        icon: {
          content: `
            <div style="
              background: rgba(255, 255, 255, 0.95);
              border: 2px solid #ff0000;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
              color: #333;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ${timeSlot} ${traffic.toLocaleString()}명
            </div>
          `,
          anchor: new naver.maps.Point(0, 0),
        },
      });

      // 오버레이 저장
      overlaysRef.current.push(circle);
      overlaysRef.current.push(marker);
    });
  }, [heatmapData, center]);

  if (error) {
    return (
      <div className="w-full h-full bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">지도 로딩 중...</p>
          <p className="text-xs text-gray-500 mt-2">Naver Maps API 초기화 중</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="rounded-lg"
        style={{
          height: '320px',
          width: '100%',
          position: 'relative'
        }}
      />

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">유동인구 밀도</h4>
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-20"></div>
            <span className="text-gray-600">낮음</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-50"></div>
            <span className="text-gray-600">높음</span>
          </div>
        </div>
      </div>
    </div>
  );
}
