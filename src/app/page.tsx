'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-white">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl">🏪</span>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  용인 소상공인 활력 지수
                </span>
                <span className="text-xl font-bold text-gray-900 sm:hidden">
                  활력 지수
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button
                onClick={() => router.push('/about')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-1">ℹ️</span>
                프로젝트 소개
              </button>
              <button
                onClick={() => router.push('/guide')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-1">📘</span>
                사용자 가이드
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">모든 용인 소상공인이</span>
                  <span className="block text-blue-600">대기업 수준의 데이터로</span>
                  <span className="block">스마트하게 경쟁하는 세상</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  경기도 공공 데이터와 AI 기술로 용인시 소상공인에게
                  자신의 상권에 대한 깊이 있는 통찰력을 제공하는 상권 분석 플랫폼입니다.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      무료로 시작하기
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border-2 border-green-500 text-base font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 md:py-4 md:text-lg md:px-10"
                    >
                      <span className="mr-2">🎭</span>
                      데모 체험하기
                    </Link>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm lg:text-left text-center">
                  데모 계정으로 모든 기능을 바로 체험해보세요
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">핵심 기능</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              데이터 기반 스마트 경영
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              복잡한 데이터를 쉽게 이해하고, 실행 가능한 인사이트를 얻으세요
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">실시간 상권 분석</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  유동인구, 소비 트렌드, 고객 인구통계 등을 한눈에 확인하세요
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-2xl">🗺️</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">상권 활력 지수 히트맵</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  내 가게 주변 상권의 활력도를 시각적으로 확인하세요
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI 주간 보고서</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  매주 맞춤형 인사이트와 실행 가능한 비즈니스 제안을 받아보세요
                </p>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-2xl">💰</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">무료 또는 저비용</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  대기업 수준의 분석을 무료 또는 월 2-3만 원으로 이용하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              용인시 소상공인을 위한 플랫폼
            </h2>
            <p className="mt-3 text-xl text-blue-200 sm:mt-4">
              데이터 기반 의사결정으로 매출 안정성을 향상시키세요
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                소상공인 사업장
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">10만+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                목표 가입자
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">500</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                매주 AI 보고서
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">1회</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">지금 바로 시작하세요</span>
            <span className="block text-blue-600">3분이면 준비 완료</span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-green-500 text-base font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 shadow-md"
            >
              <span className="mr-2">🎭</span>
              데모 체험하기
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
