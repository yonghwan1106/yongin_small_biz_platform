// User Types
export interface User {
  userId: string;
  email: string;
  storeName?: string;
  storeCategory?: StoreCategory;
  storeAddress?: string;
  storeLatLng?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  marketingConsent: boolean;
}

export type StoreCategory = '외식업' | '소매업' | '서비스업' | '기타';

export interface UserCreateInput {
  email: string;
  password: string;
  agreements: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  };
}

export interface UserUpdateInput {
  storeName?: string;
  storeCategory?: StoreCategory;
  storeAddress?: string;
  storeLatLng?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: Omit<User, 'passwordHash'>;
  message?: string;
  error?: string;
}

// Dashboard Types
export interface DashboardSummary {
  todayFootTraffic: number;
  todayFootTrafficChange: number;
  weeklyAverageFootTraffic: number;
  weeklyFootTrafficChange: number;
  monthlyConsumptionTrend: number;
  monthlyConsumptionChange: number;
  // 데이터 출처 메타정보
  dataSource: {
    isRealData: boolean;
    source: 'gyeonggi_public_data' | 'telecom_api' | 'mock';
    dataPeriod: string; // 예: "2025년 8월"
    lastUpdated?: string;
    recordCount?: number;
  };
}

export interface HeatmapData {
  vitalityIndex: number;
  grade: '매우높음' | '높음' | '보통' | '낮음';
  heatmapData: HeatmapPoint[];
  breakdown: {
    footTraffic: number;
    consumption: number;
    growth: number;
  };
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  footTraffic: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

// Report Types
export interface Report {
  reportId: string;
  userId: string;
  reportDate: string;
  content: string;
  summary: string;
  dataSnapshot?: any;
  isRead: boolean;
  feedback: 0 | 1 | -1;
  createdAt: string;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
  hasMore: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Gyeonggi API Types
export interface GyeonggiFootTrafficData {
  date: string;
  lat: number;
  lng: number;
  footTraffic: number;
  timeSlot?: string;
  ageGroup?: string;
  gender?: string;
}

export interface GyeonggiConsumptionData {
  date: string;
  lat: number;
  lng: number;
  consumption: number;
  category?: string;
}

// Location Types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}
