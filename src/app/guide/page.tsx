import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📘 사용자 가이드
          </h1>
          <p className="text-xl text-gray-600">
            용인 소상공인 활력 지수 플랫폼 사용 방법을 안내합니다
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">🚀</span>
            빠른 시작
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mr-4">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">회원가입</h3>
                <p className="text-gray-600 text-sm">
                  이메일과 비밀번호로 간단하게 회원가입하세요. 데모 계정으로 먼저 체험해볼 수도 있습니다.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mr-4">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">가게 정보 등록</h3>
                <p className="text-gray-600 text-sm">
                  온보딩 과정에서 가게 이름, 주소, 업종을 입력하세요. Naver Maps 검색으로 정확한 위치를 찾을 수 있습니다.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mr-4">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">대시보드 확인</h3>
                <p className="text-gray-600 text-sm">
                  실시간 유동인구, 주간 평균 방문, 월간 소비 트렌드 등 다양한 데이터를 확인하세요.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mr-4">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">AI 보고서 받기</h3>
                <p className="text-gray-600 text-sm">
                  매주 월요일 새벽 4시에 자동으로 생성되는 맞춤형 AI 보고서를 확인하세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">📊</span>
            대시보드 활용법
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">오늘 유동인구</h3>
              <p className="text-gray-600 text-sm mb-2">
                가게 주변 500m 반경 내 오늘의 유동인구를 표시합니다.
              </p>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                <li>전일 대비 증감율(%)이 함께 표시됩니다</li>
                <li>녹색 ↑: 증가, 빨간색 ↓: 감소</li>
                <li>KT·SK·LG 통신사 실제 데이터 기반</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">주간 평균 방문</h3>
              <p className="text-gray-600 text-sm mb-2">
                최근 7일간의 평균 유동인구를 보여줍니다.
              </p>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                <li>전주 대비 변화율을 확인할 수 있습니다</li>
                <li>주간 트렌드 파악에 유용합니다</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">월간 소비 트렌드</h3>
              <p className="text-gray-600 text-sm mb-2">
                최근 30일간의 상권 소비 금액을 집계합니다.
              </p>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                <li>전월 대비 증감을 확인할 수 있습니다</li>
                <li>상권의 경제 활력도를 파악하세요</li>
              </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">상권 활력 지수 히트맵</h3>
              <p className="text-gray-600 text-sm mb-2">
                Naver Maps 기반으로 주변 상권의 유동인구를 시각화합니다.
              </p>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                <li>빨간색: 높음 (70% 이상)</li>
                <li>주황색: 중간 (40-70%)</li>
                <li>노란색: 낮음 (40% 미만)</li>
                <li>마커를 클릭하면 상세 정보 확인 가능</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">유동인구 추이 차트</h3>
              <p className="text-gray-600 text-sm mb-2">
                최근 7일간의 일별 유동인구 변화를 그래프로 보여줍니다.
              </p>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                <li>꺾은선 그래프로 트렌드 파악</li>
                <li>마우스를 올리면 정확한 수치 확인</li>
              </ul>
            </div>
          </div>
        </div>

        {/* AI Report Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">🤖</span>
            AI 보고서 활용법
          </h2>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">생성 주기</h3>
              <p className="text-gray-600 text-sm">
                매주 월요일 새벽 4시에 자동으로 생성됩니다. Anthropic Claude AI가 여러분의 업종과 상권 데이터를 분석하여 맞춤형 인사이트를 제공합니다.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">보고서 내용</h3>
              <ul className="text-gray-600 text-sm space-y-2 list-disc list-inside">
                <li><strong>주간 요약:</strong> 지난 주의 주요 트렌드와 변화</li>
                <li><strong>강점 분석:</strong> 상권의 긍정적인 요소</li>
                <li><strong>개선 제안:</strong> 구체적이고 실행 가능한 조언</li>
                <li><strong>다음 주 전망:</strong> 예상되는 변화와 대응 방안</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">보고서 확인하기</h3>
              <p className="text-gray-600 text-sm mb-2">
                상단 메뉴의 "🤖 AI 보고서"를 클릭하면 과거 보고서를 모두 확인할 수 있습니다.
              </p>
              <Link
                href="/reports"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                AI 보고서 보러가기 →
              </Link>
            </div>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">📡</span>
            데이터 출처 및 신뢰도
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                KT · SK텔레콤 · LG U+ 통신사 데이터
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">⭐⭐⭐⭐⭐ 실제 데이터</span>
              </h3>
              <p className="text-gray-600 text-sm">
                경기도 공공데이터 포털의 생활이동인구 데이터는 국내 3대 통신사의 이동통신 기지국 데이터를 기반으로 집계됩니다.
                정부 공식 통계로 신뢰도가 매우 높습니다.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>💡 알아두세요:</strong> 현재 2025년 8월 데이터를 사용하고 있습니다.
                매월 1일 자동으로 최신 데이터로 업데이트됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">❓</span>
            자주 묻는 질문
          </h2>

          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Q. 데이터는 얼마나 자주 업데이트되나요?
              </summary>
              <div className="mt-2 p-3 text-gray-600 text-sm">
                유동인구 데이터는 매일 업데이트되며, 경기도 공공데이터는 매월 1일 최신 데이터로 갱신됩니다.
                AI 보고서는 매주 월요일 새벽 4시에 자동 생성됩니다.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Q. 데모 계정으로 어떤 기능을 체험할 수 있나요?
              </summary>
              <div className="mt-2 p-3 text-gray-600 text-sm">
                데모 계정으로 모든 기능을 체험할 수 있습니다. 실제 용인시 카페 데이터를 기반으로
                대시보드, AI 보고서, 히트맵 등을 확인해보세요.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Q. 내 가게 주소를 변경하려면?
              </summary>
              <div className="mt-2 p-3 text-gray-600 text-sm">
                상단 메뉴의 "👤 내 정보"를 클릭하여 프로필 페이지에서 가게 정보를 수정할 수 있습니다.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Q. 이용 요금이 있나요?
              </summary>
              <div className="mt-2 p-3 text-gray-600 text-sm">
                현재 MVP 단계로 무료로 제공됩니다. 모든 기능을 제한 없이 사용하실 수 있습니다.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Q. 용인시가 아닌 다른 지역도 지원하나요?
              </summary>
              <div className="mt-2 p-3 text-gray-600 text-sm">
                현재는 용인시만 지원하지만, 향후 경기도 전역으로 확대할 계획입니다.
              </div>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            준비되셨나요?
          </h2>
          <p className="text-lg mb-8 text-green-100">
            지금 바로 데이터 기반 경영 인사이트를 받아보세요!
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              회원가입하기
            </Link>
            <Link
              href="/dashboard"
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors border-2 border-white"
            >
              대시보드 보기
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
