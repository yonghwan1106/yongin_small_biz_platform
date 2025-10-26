'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StoreCategory } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeCategory: '' as StoreCategory | '',
    storeAddress: '',
    storeLatLng: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.storeName) {
        setErrors({ storeName: '가게 이름을 입력해주세요.' });
        return;
      }
      if (!formData.storeAddress) {
        setErrors({ storeAddress: '가게 주소를 입력해주세요.' });
        return;
      }

      // 주소 → 좌표 변환 (Geocoding)
      setIsLoading(true);
      try {
        const response = await fetch(`/api/geocode?address=${encodeURIComponent(formData.storeAddress)}`);
        const data = await response.json();

        if (data.success && data.data) {
          // lat,lng 형식으로 저장
          setFormData(prev => ({
            ...prev,
            storeLatLng: `${data.data.lat},${data.data.lng}`,
          }));
          setCurrentStep(3);
        } else {
          setErrors({ storeAddress: data.message || '주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.' });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setErrors({ storeAddress: '주소 변환 중 오류가 발생했습니다.' });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 3) {
      if (!formData.storeCategory) {
        setErrors({ storeCategory: '업종을 선택해주세요.' });
        return;
      }
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setErrors({ general: data.message || '정보 저장에 실패했습니다.' });
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setErrors({ general: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              환영합니다!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              용인 소상공인 활력 지수와 함께<br />
              데이터 기반 스마트 경영을 시작해보세요.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">시작하기 전에:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>3분이면 준비 완료</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>가게 정보를 입력하세요</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>맞춤형 상권 분석을 받아보세요</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="text-5xl text-center mb-6">📍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              가게 위치를 알려주세요
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              정확한 상권 분석을 위해 가게 정보가 필요합니다.
            </p>

            {errors.general && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                  가게 이름
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="예: 민준이네 레스토랑"
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.storeName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.storeName && (
                  <p className="mt-2 text-sm text-red-600">{errors.storeName}</p>
                )}
              </div>

              <div>
                <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  가게 주소
                </label>
                <input
                  id="storeAddress"
                  name="storeAddress"
                  type="text"
                  value={formData.storeAddress}
                  onChange={handleChange}
                  placeholder="예: 경기도 용인시 수지구 풍덕천동 123-45"
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.storeAddress ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.storeAddress && (
                  <p className="mt-2 text-sm text-red-600">{errors.storeAddress}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  * 주소가 자동으로 검증됩니다 (예: 경기도 용인시 처인구 삼가동 123-45)
                </p>
              </div>

              {/* Placeholder for Naver Maps integration */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-500">🗺️ 지도 미리보기</p>
                <p className="text-xs text-gray-400 mt-2">
                  Naver Maps API 통합 예정
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="text-5xl text-center mb-6">🍴</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              어떤 업종인가요?
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              업종에 맞는 맞춤형 인사이트를 제공합니다.
            </p>

            {errors.general && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            <div className="space-y-4">
              {['외식업', '소매업', '서비스업', '기타'].map((category) => (
                <div
                  key={category}
                  onClick={() => setFormData(prev => ({ ...prev, storeCategory: category as StoreCategory }))}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.storeCategory === category
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      formData.storeCategory === category
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.storeCategory === category && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category}</p>
                      <p className="text-sm text-gray-500">
                        {category === '외식업' && '카페, 레스토랑, 주점 등'}
                        {category === '소매업' && '의류, 잡화, 편의점 등'}
                        {category === '서비스업' && '미용실, 학원, 헬스장 등'}
                        {category === '기타' && '기타 업종'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {errors.storeCategory && (
                <p className="text-sm text-red-600">{errors.storeCategory}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentStep} / 3
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
              >
                이전
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`px-6 py-3 rounded-md font-medium text-white ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? '처리 중...' : currentStep === 3 ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
