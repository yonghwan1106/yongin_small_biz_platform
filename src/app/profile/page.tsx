'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  userId: string;
  email: string;
  storeName: string;
  storeAddress: string;
  storeCategory: string;
  storeLatLng: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    storeName: '',
    storeAddress: '',
    storeCategory: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
        setEditForm({
          storeName: data.data.storeName || '',
          storeAddress: data.data.storeAddress || '',
          storeCategory: data.data.storeCategory || '',
        });
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        alert('정보가 수정되었습니다!');
        setIsEditing(false);
        fetchUserData();
      } else {
        alert(`수정 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to update user data:', error);
      alert('정보 수정 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            👤 내 정보
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            회원 정보 및 가게 정보를 관리합니다
          </p>
        </div>

        <div className="space-y-6">
          {/* 계정 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                계정 정보
              </h2>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                로그아웃
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex">
                <div className="w-32 text-sm font-medium text-gray-500">
                  이메일
                </div>
                <div className="flex-1 text-sm text-gray-900">
                  {userData.email}
                </div>
              </div>
              <div className="flex">
                <div className="w-32 text-sm font-medium text-gray-500">
                  사용자 ID
                </div>
                <div className="flex-1 text-sm text-gray-900 font-mono">
                  {userData.userId}
                </div>
              </div>
              <div className="flex">
                <div className="w-32 text-sm font-medium text-gray-500">
                  가입일
                </div>
                <div className="flex-1 text-sm text-gray-900">
                  {formatDate(userData.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* 가게 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                가게 정보
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  수정
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가게명
                  </label>
                  <input
                    type="text"
                    value={editForm.storeName}
                    onChange={(e) => setEditForm({ ...editForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    value={editForm.storeAddress}
                    onChange={(e) => setEditForm({ ...editForm, storeAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    업종
                  </label>
                  <select
                    value={editForm.storeCategory}
                    onChange={(e) => setEditForm({ ...editForm, storeCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">업종을 선택하세요</option>
                    <option value="음식점">음식점</option>
                    <option value="카페">카페</option>
                    <option value="소매업">소매업</option>
                    <option value="서비스업">서비스업</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        storeName: userData.storeName || '',
                        storeAddress: userData.storeAddress || '',
                        storeCategory: userData.storeCategory || '',
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-32 text-sm font-medium text-gray-500">
                    가게명
                  </div>
                  <div className="flex-1 text-sm text-gray-900">
                    {userData.storeName || '-'}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 text-sm font-medium text-gray-500">
                    주소
                  </div>
                  <div className="flex-1 text-sm text-gray-900">
                    {userData.storeAddress || '-'}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 text-sm font-medium text-gray-500">
                    업종
                  </div>
                  <div className="flex-1 text-sm text-gray-900">
                    {userData.storeCategory || '-'}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-32 text-sm font-medium text-gray-500">
                    좌표
                  </div>
                  <div className="flex-1 text-sm text-gray-900 font-mono">
                    {userData.storeLatLng || '-'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 통계 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              이용 통계
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-600">
                  서비스 이용일수
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  0
                </div>
                <div className="text-sm text-gray-600">
                  생성된 보고서
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  7
                </div>
                <div className="text-sm text-gray-600">
                  데이터 수집일수
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              빠른 링크
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-gray-900 mb-1">대시보드</div>
                <div className="text-sm text-gray-600">
                  유동인구 및 소비 데이터 확인
                </div>
              </button>

              <button
                onClick={() => router.push('/reports')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-semibold text-gray-900 mb-1">AI 보고서</div>
                <div className="text-sm text-gray-600">
                  주간 분석 보고서 확인
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
