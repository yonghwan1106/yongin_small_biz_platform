'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Location, GyeonggiFootTrafficData } from '@/types';

interface LeafletHeatmapProps {
  center: Location;
  heatmapData?: GyeonggiFootTrafficData[];
}

export default function LeafletHeatmap({ center, heatmapData }: LeafletHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Leaflet 지도 생성
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 15);

    // OpenStreetMap 타일 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // 중심 마커 추가
    const centerMarker = L.marker([center.lat, center.lng])
      .addTo(map)
      .bindPopup('<strong>내 가게</strong>')
      .openPopup();

    mapInstance.current = map;

    // 정리 함수
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center.lat, center.lng]);

  // 히트맵 데이터 업데이트
  useEffect(() => {
    if (!mapInstance.current || !heatmapData || heatmapData.length === 0) {
      console.log('🗺️ Heatmap data not available:', {
        hasMap: !!mapInstance.current,
        hasData: !!heatmapData,
        dataLength: heatmapData?.length || 0
      });
      return;
    }

    console.log('🗺️ Rendering Leaflet heatmap with', heatmapData.length, 'data points');

    // 기존 히트맵 레이어 제거
    if (heatLayerRef.current) {
      mapInstance.current.removeLayer(heatLayerRef.current);
    }

    // 시간대별 데이터 집계
    const timeSlotData = new Map<string, number>();
    heatmapData.forEach(d => {
      const timeSlot = d.timeSlot || '';
      const current = timeSlotData.get(timeSlot) || 0;
      timeSlotData.set(timeSlot, current + d.footTraffic);
    });

    // 상위 10개 시간대
    const sortedSlots = Array.from(timeSlotData.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log('📊 Top 10 time slots:', sortedSlots.map(([time, traffic]) => `${time}: ${traffic}`));

    // 최대값 (강도 계산용)
    const maxTraffic = sortedSlots.length > 0 ? sortedSlots[0][1] : 1;

    // 히트맵 포인트 데이터 준비 [lat, lng, intensity]
    const heatPoints: [number, number, number][] = sortedSlots.map(([timeSlot, traffic], index) => {
      const offsetLat = (Math.random() - 0.5) * 0.005; // 약 250m 반경
      const offsetLng = (Math.random() - 0.5) * 0.005;
      const intensity = traffic / maxTraffic; // 0-1 사이 값

      return [
        center.lat + offsetLat,
        center.lng + offsetLng,
        intensity
      ];
    });

    // @ts-ignore - leaflet.heat 타입 정의 없음
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 25,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: 'blue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        1.0: 'red'
      }
    }).addTo(mapInstance.current);

    heatLayerRef.current = heatLayer;

    // 마커 추가 (시간대별 상위 5개)
    sortedSlots.slice(0, 5).forEach(([timeSlot, traffic], index) => {
      const offsetLat = (Math.random() - 0.5) * 0.003;
      const offsetLng = (Math.random() - 0.5) * 0.003;

      const marker = L.circleMarker([center.lat + offsetLat, center.lng + offsetLng], {
        radius: 8,
        fillColor: traffic / maxTraffic > 0.7 ? '#EF4444' :
                   traffic / maxTraffic > 0.4 ? '#F59E0B' : '#FCD34D',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
      .bindPopup(`
        <div style="padding: 8px;">
          <strong>${timeSlot}</strong><br/>
          유동인구: ${traffic.toLocaleString()}명
        </div>
      `)
      .addTo(mapInstance.current!);
    });

  }, [heatmapData, center.lat, center.lng]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '320px',
        }}
      />

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
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
          </div>
        )}
      </div>
    </div>
  );
}
