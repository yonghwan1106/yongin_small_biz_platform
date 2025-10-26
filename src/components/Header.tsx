'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is logged in (JWT token in localStorage)
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
      // TODO: Decode token to get user name
      setUserName('사용자');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">📊</div>
              <span className="text-xl font-bold text-gray-900">
                용인 소상공인 활력 지수
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium ${
                    pathname === '/dashboard'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  대시보드
                </Link>
                <Link
                  href="/reports"
                  className={`text-sm font-medium ${
                    pathname === '/reports'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  AI 보고서
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium ${
                    pathname === '/profile'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  내 정보
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  서비스 소개
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-700">{userName}님</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  무료로 시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden border-t border-gray-200">
        <nav className="px-4 py-3 space-y-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                대시보드
              </Link>
              <Link
                href="/reports"
                className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                AI 보고서
              </Link>
              <Link
                href="/profile"
                className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                내 정보
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/about"
                className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                서비스 소개
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
