# 용인 소상공인 활력 지수

**AI 기반 상권 분석 SaaS 플랫폼**

모든 용인 소상공인이 대기업 수준의 데이터 인사이트로 스마트하게 경쟁할 수 있도록 돕는 플랫폼입니다.

---

## 📋 프로젝트 개요

경기도 공공 데이터와 AI 기술을 활용하여 용인시 소상공인에게 자신의 상권에 대한 깊이 있는 통찰력을 제공하는 상권 분석 플랫폼입니다.

### 핵심 가치 제안

- **접근성**: 무료 또는 저비용으로 전문가 수준의 상권 분석 제공
- **단순성**: 복잡한 데이터를 일반인도 이해 가능한 자연어 인사이트로 변환
- **실행 가능성**: 구체적이고 즉시 실행 가능한 비즈니스 제안
- **지속성**: 일회성이 아닌, 지속적인 모니터링과 트렌드 추적

---

## 🚀 기술 스택

### Frontend
- **Next.js 16.0.0** - React 프레임워크 (App Router, Turbopack)
- **TypeScript 5** - 타입 안전성
- **TailwindCSS 4** - 스타일링
- **Naver Maps API** - 지도 및 주소 검색 (예정)
- **Chart.js** - 차트 라이브러리 (예정)

### Backend
- **Next.js API Routes** - RESTful API
- **Vercel Functions** - 서버리스 실행 환경
- **bcryptjs** - 비밀번호 해싱
- **jsonwebtoken** - JWT 인증

### Database
- **Google Sheets API** - MVP 단계 데이터 저장소
  - Users 시트 (사용자 정보)
  - Reports 시트 (AI 보고서)

### External APIs
- **경기도 공공데이터 포털** - KT/SK/LG 통신사 집계 생활이동인구 데이터 ✅
- **Anthropic Claude API** - AI 주간 보고서 생성 ✅
- **Naver Maps API** - 지도 렌더링 및 히트맵 시각화 ✅

---

## ✅ 개발 현황 (2025년 1월 - MVP 배포 완료)

### Phase 0: 프로젝트 기본 셋업 ✅

- [x] Next.js 16.0.0 프로젝트 초기화
- [x] TypeScript, TailwindCSS, ESLint 설정
- [x] 프로젝트 폴더 구조 생성
- [x] 환경 변수 설정 (.env.example, .env.local)
- [x] 필수 패키지 설치

### Phase 1: 인증 시스템 ✅

- [x] TypeScript 타입 정의 (User, Auth, Dashboard, Report 등)
- [x] Google Sheets 데이터베이스 연동
- [x] JWT 인증 유틸리티 (토큰 생성/검증, 비밀번호 해싱)
- [x] 회원가입 API (`POST /api/auth/signup`)
- [x] 로그인 API (`POST /api/auth/login`)
- [x] 사용자 정보 API (`GET/PATCH /api/users/me`)

### Phase 2: 사용자 인터페이스 ✅

- [x] Navigation 컴포넌트 (반응형, 모바일 햄버거 메뉴)
- [x] 랜딩 페이지 (Hero, Features, Stats, CTA)
- [x] 회원가입 페이지 (`/signup`)
- [x] 로그인 페이지 (`/login`)
- [x] 온보딩 플로우 (3단계: 환영, 가게 정보, 업종 선택)
- [x] 대시보드 메인 페이지 (KPI 카드, 히트맵, 차트, AI 인사이트)
- [x] 프로필 페이지 (`/profile`)
- [x] AI 보고서 페이지 (`/reports`)

### Phase 3: 데이터 통합 ✅

- [x] 경기도 유동인구 데이터 연동 (CSV 파싱 및 Google Sheets 업로드)
- [x] 787MB CSV 파일 처리 (810만 행 → 29,016건 집계)
- [x] 용인시 39개 행정동 시간대별 유동인구 데이터
- [x] 대시보드 Summary API (`GET /api/dashboard/summary`)
- [x] 대시보드 Chart API (`GET /api/dashboard/chart`)
- [x] 대시보드 Heatmap API (`GET /api/dashboard/heatmap`)
- [x] Chart.js 차트 컴포넌트
- [x] Naver Maps 히트맵 컴포넌트 (원형 오버레이, 색상 코드, InfoWindow)

### Phase 4: AI 보고서 시스템 ✅

- [x] Anthropic Claude API 연동
- [x] AI 보고서 생성 API (`POST /api/reports/generate`)
- [x] 보고서 목록 API (`GET /api/reports/list`)
- [x] 보고서 페이지 UI (마크다운 렌더링)
- [x] 주간 자동 보고서 Cron Job (`/api/cron/weekly-reports`)
- [x] 월간 데이터 업데이트 Cron Job (`/api/cron/update-gyeonggi-data`)
- [x] Vercel Cron 설정 (주간: 월요일 04:00, 월간: 매월 1일 03:00)
- [x] 개선된 AI 프롬프트 (업종별 맞춤, 실행 가능한 조언)

### Phase 5: UX/UI 개선 및 배포 ✅

- [x] 스켈레톤 로딩 컴포넌트 (Dashboard, Reports)
- [x] 인라인 스피너 컴포넌트 (로딩 상태 표시)
- [x] Toast 알림 시스템 (성공/에러/경고/정보)
- [x] Error Boundary (런타임 에러 처리)
- [x] 모바일 반응형 최적화 (텍스트 크기, 간격, 터치 영역)
- [x] Vercel 프로덕션 배포
- [x] 환경 변수 설정 및 검증
- [x] GitHub 저장소 연동

---

## 📂 프로젝트 구조

```
yongin_small_biz_platform/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signup/route.ts
│   │   │   │   └── login/route.ts
│   │   │   ├── users/
│   │   │   │   └── me/route.ts
│   │   │   ├── dashboard/
│   │   │   ├── reports/
│   │   │   └── cron/
│   │   ├── signup/page.tsx
│   │   ├── login/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Auth/
│   │   ├── Charts/
│   │   ├── Dashboard/
│   │   ├── Map/
│   │   └── Onboarding/
│   ├── lib/
│   │   ├── database.ts (Google Sheets 연동)
│   │   ├── auth.ts (JWT 인증)
│   │   └── data-sources/
│   └── types/
│       └── index.ts
├── docs/
│   └── prd.md
├── .env.example
├── .env.local
├── package.json
└── README.md
```

---

## 🎭 데모 계정

바로 기능을 체험해보고 싶으시다면 데모 계정을 사용하세요:

```
이메일:    demo@yongin-bizplatform.com
비밀번호:  demo1234
```

**포함된 샘플 데이터:**
- 최근 30일간의 유동인구 데이터 (180개 데이터 포인트)
- 샘플 AI 주간 보고서
- 대시보드 KPI 차트 데이터

**데모 계정 생성 방법:**
```bash
node scripts/init-sheets.js        # Google Sheets 초기화
node scripts/create-demo-account.js # 데모 계정 및 샘플 데이터 생성
```

### 📊 통신사 실시간 데이터 연동 완료

프로젝트는 경기도 공공데이터 포털의 **실제 생활이동인구 데이터**를 사용합니다:

#### 🔗 데이터 출처
- **통신사**: KT · SK텔레콤 · LG U+ (3대 이동통신사)
- **수집 방법**: 이동통신 기지국 기반 실시간 집계
- **제공**: 경기도 공공데이터 포털 ([data.gg.go.kr](https://data.gg.go.kr/))
- **신뢰도**: ⭐⭐⭐⭐⭐ (정부 공식 통계 데이터)

#### 📈 데이터 현황
- **기간**: 2025년 8월 (20250801-20250831)
- **범위**: 용인시 39개 행정동
- **상세도**: 시간대별(24시간) 유동인구
- **총 레코드**: 29,016건 (810만 원본 행 집계)
- **총 유동인구**: 4,580만 명 추적

#### 🔄 데이터 업데이트 방법
```bash
# 1. 경기도 공공데이터 포털에서 최신 CSV 다운로드
#    → https://data.gg.go.kr/portal/data/service/selectServicePage.do?infId=Y1HVUV7QPINQ0OG8A1R534987376
# 2. docs/ 폴더에 CSV 파일 저장
npm run parse-gyeonggi    # CSV 파싱 및 집계 (29,016건)
npm run upload-gyeonggi   # Google Sheets 업로드
npm run view-data         # 업로드된 데이터 샘플 확인
```

#### 📡 자동 업데이트 (Vercel Cron)
- **주기**: 매월 1일 03:00 (KST)
- **엔드포인트**: `/api/cron/update-gyeonggi-data`
- **기능**: 데이터 상태 점검 및 UpdateLog 기록

---

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# Google Sheets API
GOOGLE_SHEETS_API_KEY=your_key
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_SHEET_ID=your_sheet_id

# 경기도 공공데이터 API
GYEONGGI_API_KEY=your_key

# Naver Maps API
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID=your_client_id

# Anthropic Claude API
ANTHROPIC_API_KEY=your_key

# JWT Secret (32+ characters)
JWT_SECRET=your_secret_key

# Cron Job Secret
CRON_SECRET=your_cron_secret
```

### 3. Google Sheets 설정

1. Google Cloud Console에서 Service Account 생성
2. Google Sheets API 활성화
3. 새 Google Sheet 생성 후 Service Account에 편집 권한 부여
4. 시트에 "Users"와 "Reports" 탭 생성
5. `.env.local`에 Sheet ID 입력

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 🌐 API 엔드포인트

### 인증 API

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인

### 사용자 API

- `GET /api/users/me` - 현재 사용자 정보 조회
- `PATCH /api/users/me` - 사용자 정보 수정

### 대시보드 API

- `GET /api/dashboard/summary` - 주요 지표 요약 (오늘/주간 유동인구, 월간 소비 트렌드)
- `GET /api/dashboard/heatmap` - 상권 활력 지수 히트맵 데이터
- `GET /api/dashboard/chart?days=7` - 유동인구 차트 데이터 (최근 N일)

### 보고서 API

- `POST /api/reports/generate` - AI 보고서 생성
- `GET /api/reports/list` - 보고서 목록 조회

### Cron API

- `GET /api/cron/weekly-reports` - 주간 보고서 자동 생성 (매주 월요일 04:00 UTC)
- `GET /api/cron/update-gyeonggi-data` - 경기도 데이터 업데이트 체크 (매월 1일 03:00 UTC)

---

## 🚀 배포 정보

### 프로덕션 배포

- **배포 플랫폼**: Vercel
- **배포 URL**: https://yonginsmallbizplatform.vercel.app
- **자동 배포**: GitHub master 브랜치에 push 시 자동 배포
- **환경**: Node.js 20.x, Next.js 16.0.0
- **Cron Jobs**:
  - 주간 AI 보고서 생성 (매주 월요일 04:00 UTC)
  - 월간 데이터 업데이트 체크 (매월 1일 03:00 UTC)

### 환경 변수 설정 완료

모든 필수 환경 변수가 Vercel에 설정되어 있습니다:
- Google Sheets API 인증
- Anthropic Claude API 키
- Naver Maps API 클라이언트 ID
- JWT Secret
- Cron Job Secret

## 📋 다음 단계 (Phase 2 - 성장 단계)

### 우선순위 높음

1. **실제 데이터 통합**
   - 경기도 공공데이터 API 실시간 연동 (현재 샘플 데이터 사용)
   - 데이터 검증 및 품질 관리
   - 데이터 업데이트 스케줄 구현

2. **사용자 피드백 수집**
   - 베타 테스터 모집
   - 피드백 채널 구축
   - 사용성 테스트

3. **성능 최적화**
   - 이미지 최적화
   - 번들 사이즈 최적화
   - API 응답 캐싱

### 기능 개선 (Phase 2)

- 소셜 로그인 (네이버, 카카오)
- 비밀번호 찾기
- 알림 기능 (이메일, 푸시)
- 경쟁 상권 분석
- 과거 데이터 비교 기능
- 프리미엄 기능 (고급 분석, 맞춤형 보고서)

### 문서화

- API 문서 작성 (Swagger/OpenAPI)
- 사용자 가이드 작성
- 관리자 가이드 작성
- 기술 블로그 포스팅

---

## 📊 MVP 성공 지표 (출시 후 3개월)

- **사용자**: 총 가입자 500명, MAU 300명 (60%)
- **참여도**: 주간 재방문율 40%, AI 리포트 조회율 60%
- **만족도**: NPS 40 이상, 유용성 평가 4.0/5.0 이상

---

## 🎯 프로젝트 로드맵

### Phase 1: MVP 개발 (현재 진행 중)
- Week 1-2: 프로젝트 셋업 ✅
- Week 3-4: 인증 시스템 ✅
- Week 5-6: 온보딩 및 대시보드 UI ✅
- Week 7-8: 데이터 파이프라인 (진행 예정)
- Week 9: AI 보고서 생성 (진행 예정)
- Week 10: 보고서 UI (진행 예정)
- Week 11: 통합 테스트 (진행 예정)
- Week 12: 베타 출시 준비 (진행 예정)

### Phase 2: 성장 (출시 후 6개월)
- 프리미엄 기능 추가
- 소셜 로그인 (네이버, 카카오)
- 비밀번호 찾기
- 알림 기능

### Phase 3: 확장 (출시 후 1년)
- 타 지역 확장 (성남시, 수원시)
- Firebase/Supabase 마이그레이션
- 모바일 앱 개발

---

## 📝 참고 문서

- [PRD (제품 요구사항 정의서)](./docs/prd.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Naver Maps API](https://navermaps.github.io/maps.js.ncp/)

---

## 🤝 기여

이 프로젝트는 현재 개발 중입니다. 문의사항이나 제안사항이 있으시면 이슈를 등록해주세요.

---

## 📄 라이선스

MIT License

---

**개발 시작일**: 2025년 1월
**현재 상태**: ✅ **MVP 개발 및 배포 완료** (100%)
**프로덕션 URL**: https://yonginsmallbizplatform.vercel.app
**개발 서버**: http://localhost:3000

---

## 🎉 MVP 달성 현황

### ✅ 완료된 핵심 기능

**인증 & 온보딩**
- JWT 기반 회원가입/로그인
- 3단계 온보딩 플로우 (가게 정보 등록)
- 프로필 관리

**대시보드**
- 3개 KPI 카드 (오늘 유동인구, 주간 평균, 월간 소비)
- Naver Maps 히트맵 (원형 오버레이, 색상 코드)
- Chart.js 유동인구 차트
- 반응형 디자인 (모바일 최적화)

**AI 보고서**
- Claude AI 기반 주간 보고서 자동 생성
- 업종별 맞춤형 분석 및 추천
- 마크다운 렌더링
- Vercel Cron을 통한 자동 스케줄링

**UX/UI**
- 스켈레톤 로딩 상태
- Toast 알림 시스템
- Error Boundary
- 모바일 반응형

### 🔧 기술 스택

- **Frontend**: Next.js 16.0, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Vercel Functions
- **Database**: Google Sheets API
- **AI**: Anthropic Claude 3.5 Sonnet
- **Maps**: Naver Maps API
- **Charts**: Chart.js
- **Deployment**: Vercel
- **Auth**: JWT, bcryptjs
