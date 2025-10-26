'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save tokens
        localStorage.setItem('auth_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }

        showToast('success', '로그인 성공! 잠시만 기다려주세요...');

        // Check if user has completed onboarding
        setTimeout(() => {
          if (data.user && data.user.storeName) {
            // User has completed onboarding, go to dashboard
            router.push('/dashboard');
          } else {
            // User hasn't completed onboarding
            router.push('/onboarding');
          }
        }, 500);
      } else {
        setErrors({ general: data.message || '로그인에 실패했습니다.' });
        showToast('error', data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      setErrors({ general: errorMessage });
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrors({ general: '이메일과 비밀번호를 입력해주세요.' });
      return;
    }

    await handleLogin(formData.email, formData.password);
  };

  const handleDemoLogin = async () => {
    await handleLogin('demo@yongin-bizplatform.com', 'demo1234');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            회원가입
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  로그인 상태 유지 (7일)
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  비밀번호 찾기
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isLoading && <Spinner size="sm" className="border-white" />}
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* Demo Account Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-green-500 rounded-md shadow-sm text-sm font-semibold ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {isLoading ? <Spinner size="sm" className="border-green-700" /> : <span className="text-xl">🎭</span>}
                데모 계정으로 체험하기
              </button>
              <p className="mt-2 text-xs text-center text-gray-500">
                샘플 데이터가 포함된 데모 계정으로 바로 기능을 체험해보세요
              </p>
            </div>

            {/* Social Login Placeholder */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                소셜 로그인은 Phase 2에서 지원 예정입니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
