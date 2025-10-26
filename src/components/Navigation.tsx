'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 로그인/회원가입 페이지에서는 네비게이션 숨김
  const hideNavigation = ['/', '/login', '/signup', '/onboarding'].includes(pathname);

  if (hideNavigation) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  // about, guide 페이지는 공개 페이지
  const isPublicPage = ['/about', '/guide'].includes(pathname);

  const navItems = [
    { name: '대시보드', path: '/dashboard', icon: '📊', public: false },
    { name: 'AI 보고서', path: '/reports', icon: '🤖', public: false },
    { name: '프로젝트 소개', path: '/about', icon: 'ℹ️', public: true },
    { name: '사용자 가이드', path: '/guide', icon: '📘', public: true },
    { name: '내 정보', path: '/profile', icon: '👤', public: false },
  ];

  return (
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
            {navItems
              .filter((item) => isPublicPage ? true : item.public === false)
              .map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            {!isPublicPage && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                로그아웃
              </button>
            )}
            {isPublicPage && (
              <button
                onClick={() => router.push('/login')}
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                로그인
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems
              .filter((item) => isPublicPage ? true : item.public === false)
              .map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            {!isPublicPage && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                로그아웃
              </button>
            )}
            {isPublicPage && (
              <button
                onClick={() => {
                  router.push('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
