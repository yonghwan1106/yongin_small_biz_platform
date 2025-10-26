'use client';

import { useEffect, useRef } from 'react';
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

export default function NaverMapSimple({ center, heatmapData }: NaverMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Naver Maps가 로드될 때까지 대기
    const initMap = () => {
      if (!window.naver || !window.naver.maps) {
        setTimeout(initMap, 100);
        return;
      }

      if (!mapElement.current || mapInstance.current) {
        return;
      }

      const naver = window.naver;

      // 지도 생성
      const map = new naver.maps.Map(mapElement.current, {
        center: new naver.maps.LatLng(center.lat, center.lng),
        zoom: 15,
        zoomControl: true,
        zoomControlOptions: {
          position: naver.maps.Position.TOP_RIGHT,
        },
      });

      mapInstance.current = map;

      // 중심 마커
      new naver.maps.Marker({
        position: new naver.maps.LatLng(center.lat, center.lng),
        map: map,
        title: '내 가게',
      });

      // 지도 리사이즈
      setTimeout(() => {
        naver.maps.Event.trigger(map, 'resize');
        map.setCenter(new naver.maps.LatLng(center.lat, center.lng));
      }, 100);
    };

    initMap();
  }, [center.lat, center.lng]);

  // 히트맵 데이터 표시
  useEffect(() => {
    if (!mapInstance.current || !heatmapData || heatmapData.length === 0) {
      console.log('🗺️ Heatmap data not available:', {
        hasMap: !!mapInstance.current,
        hasData: !!heatmapData,
        dataLength: heatmapData?.length || 0
      });
      return;
    }

    console.log('🗺️ Rendering heatmap with', heatmapData.length, 'data points');

    // Naver Maps API가 로드될 때까지 대기
    const renderHeatmap = () => {
      const naver = window.naver;
      if (!naver || !naver.maps) {
        console.log('⏳ Waiting for Naver Maps API to load...');
        setTimeout(renderHeatmap, 100);
        return;
      }

      console.log('✅ Naver Maps API loaded, rendering heatmap...');

      // 기존 마커 및 오버레이 제거
      markersRef.current.forEach(marker => {
        if (marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];

      // 시간대별 합계
      const timeSlotData = new Map<string, number>();
      heatmapData.forEach(d => {
        const timeSlot = d.timeSlot || '';
        const current = timeSlotData.get(timeSlot) || 0;
        timeSlotData.set(timeSlot, current + d.footTraffic);
      });

      // 상위 5개만 표시
      const sortedSlots = Array.from(timeSlotData.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      console.log('📊 Top 5 time slots:', sortedSlots.map(([time, traffic]) => `${time}: ${traffic}`));

      // 최대값 구하기 (색상 강도 계산용)
      const maxTraffic = sortedSlots.length > 0 ? sortedSlots[0][1] : 1;

      sortedSlots.forEach(([timeSlot, traffic], index) => {
      const offsetLat = (Math.random() - 0.5) * 0.003;
      const offsetLng = (Math.random() - 0.5) * 0.003;
      const position = new naver.maps.LatLng(center.lat + offsetLat, center.lng + offsetLng);

      // 유동인구 강도에 따른 색상 (빨강 -> 주황 -> 노랑)
      const intensity = traffic / maxTraffic;
      const color = intensity > 0.7 ? '#EF4444' : // 빨강
                    intensity > 0.4 ? '#F59E0B' : // 주황
                    '#FCD34D'; // 노랑

      // 원형 오버레이 (히트맵 효과)
      const circle = new naver.maps.Circle({
        map: mapInstance.current,
        center: position,
        radius: 100 + (intensity * 150), // 50-200m 반경
        fillColor: color,
        fillOpacity: 0.3 + (intensity * 0.3), // 0.3-0.6 투명도
        strokeColor: color,
        strokeOpacity: 0.6,
        strokeWeight: 2,
      });

      // 마커 추가
      const marker = new naver.maps.Marker({
        position: position,
        map: mapInstance.current,
        title: `${timeSlot}: ${traffic.toLocaleString()}명`,
        icon: {
          content: `<div style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${traffic.toLocaleString()}</div>`,
          anchor: new naver.maps.Point(20, 15),
        },
      });

      // InfoWindow 추가
      const infoWindow = new naver.maps.InfoWindow({
        content: `<div style="padding: 10px; min-width: 150px;">
          <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${timeSlot}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">유동인구: ${traffic.toLocaleString()}명</p>
        </div>`,
      });

      // 마커 클릭 이벤트
      naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(mapInstance.current, marker);
        }
      });

        markersRef.current.push(marker);
        markersRef.current.push(circle);
      });
    };

    // renderHeatmap 함수 호출
    renderHeatmap();
  }, [heatmapData, center.lat, center.lng]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapElement}
        style={{
          width: '100%',
          height: '320px',
        }}
      />

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">유동인구 히트맵</h4>
        {heatmapData && heatmapData.length > 0 ? (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">높음 (70%+)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-gray-600">중간 (40-70%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                <span className="text-gray-600">낮음 (~40%)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 pt-2 border-t">마커를 클릭하면 상세 정보를 확인할 수 있습니다</p>
          </>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-gray-600">
              히트맵 데이터를 불러오는 중입니다...
            </p>
            <p className="text-xs text-gray-500 mt-2">
              데이터가 표시되지 않으면 브라우저 콘솔을 확인해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
