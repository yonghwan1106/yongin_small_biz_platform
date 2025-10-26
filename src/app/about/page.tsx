import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            용인 소상공인 활력 지수
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            경기도 용인시 소상공인을 위한 데이터 기반 상권 분석 플랫폼
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">🎯</span>
            우리의 미션
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            용인 소상공인 활력 지수는 경기도 공공데이터를 활용하여 소상공인들에게
            실시간 상권 분석과 AI 기반 인사이트를 제공합니다. 데이터에 기반한
            의사결정을 통해 소상공인의 성공적인 경영을 지원합니다.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              실시간 유동인구 분석
            </h3>
            <p className="text-gray-600">
              경기도 생활이동 데이터를 기반으로 가게 주변 유동인구를 실시간으로 분석합니다.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              상권 히트맵
            </h3>
            <p className="text-gray-600">
              Naver Maps 기반 히트맵으로 시간대별 유동인구 밀도를 시각화합니다.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              소비 트렌드 분석
            </h3>
            <p className="text-gray-600">
              월간 소비 데이터를 분석하여 상권의 경제 활동 추이를 파악합니다.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI 주간 보고서
            </h3>
            <p className="text-gray-600">
              Anthropic Claude AI가 매주 맞춤형 경영 인사이트와 추천사항을 제공합니다.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              활력 지수
            </h3>
            <p className="text-gray-600">
              유동인구, 소비 데이터, 성장률을 종합하여 상권의 활력도를 0-100점으로 계산합니다.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              반응형 대시보드
            </h3>
            <p className="text-gray-600">
              PC, 태블릿, 모바일 어디서나 편리하게 데이터를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">⚙️</span>
            기술 스택
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">프론트엔드</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  Next.js 16.0 (App Router, Turbopack)
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  TypeScript 5
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  TailwindCSS 4
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  Chart.js & React-Chartjs-2
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">백엔드 & API</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  Next.js API Routes
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  Google Sheets API (Database)
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  경기도 공공데이터 API
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  Naver Maps API
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  Anthropic Claude API
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Sources Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">📡</span>
            데이터 출처
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                경기도 공공데이터 포털
              </h3>
              <p className="text-gray-600 text-sm">
                유동인구 데이터, 소비 트렌드, 상권 분석 데이터
              </p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                Naver Maps
              </h3>
              <p className="text-gray-600 text-sm">
                지도 시각화, 지오코딩, 역지오코딩
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                Anthropic Claude AI
              </h3>
              <p className="text-gray-600 text-sm">
                데이터 분석, 인사이트 생성, 맞춤형 추천
              </p>
            </div>
          </div>
        </div>

        {/* Contact & CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작하세요!
          </h2>
          <p className="text-lg mb-8 text-blue-100">
            무료로 회원가입하고 내 가게의 상권 분석을 받아보세요
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              회원가입
            </Link>
            <Link
              href="/login"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors border-2 border-white"
            >
              로그인
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            © 2025 용인 소상공인 활력 지수. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            본 서비스는 경기도 공공데이터를 활용한 MVP 프로젝트입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
