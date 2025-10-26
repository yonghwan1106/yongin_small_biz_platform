'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { SkeletonReportList, SkeletonReportContent } from '@/components/Skeleton';
import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';

interface Report {
  reportId: string;
  generatedAt: string;
  content: string;
  type: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/reports/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReports(data.data);
        if (data.data.length > 0) {
          setSelectedReport(data.data[0]); // 최신 보고서 선택
        }
      } else {
        console.error('보고서 목록 조회 실패:', data.message);
      }
    } catch (error) {
      console.error('보고서 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      router.push('/login');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', 'AI 보고서가 생성되었습니다!');
        fetchReports(); // 목록 새로고침
      } else {
        showToast('error', `보고서 생성 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('보고서 생성 실패:', error);
      showToast('error', '보고서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <SkeletonReportList />
            </div>
            <div className="lg:col-span-2">
              <SkeletonReportContent />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              🤖 AI 주간 보고서
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Claude AI가 분석한 맞춤형 경영 인사이트
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isGenerating && <Spinner size="sm" className="border-white" />}
            {isGenerating ? '생성 중...' : '새 보고서 생성'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 보고서 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-3 sm:p-4 border-b">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">보고서 목록</h2>
                <p className="text-xs text-gray-500 mt-1">
                  총 {reports.length}개
                </p>
              </div>
              <div className="divide-y max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                {reports.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p className="mb-2">아직 보고서가 없습니다.</p>
                    <p className="text-xs">
                      '새 보고서 생성' 버튼을 클릭하여 첫 보고서를 만들어보세요.
                    </p>
                  </div>
                ) : (
                  reports.map(report => (
                    <button
                      key={report.reportId}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedReport?.reportId === report.reportId
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-600 uppercase">
                          {report.type === 'weekly' ? '주간 보고서' : '보고서'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(report.generatedAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 보고서 내용 */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    주간 보고서
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    생성일: {formatDate(selectedReport.generatedAt)}
                  </p>
                </div>

                <div className="prose prose-blue max-w-none prose-sm sm:prose-base">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4 sm:mt-6 mb-3 sm:mb-4" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-4 sm:mt-5 mb-2 sm:mb-3" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-base sm:text-lg font-semibold text-gray-900 mt-3 sm:mt-4 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-gray-700 text-sm sm:text-base" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-gray-700 text-sm sm:text-base" {...props} />,
                      li: ({ node, ...props }) => <li className="ml-3 sm:ml-4 text-sm sm:text-base" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                      code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs sm:text-sm" {...props} />,
                    }}
                  >
                    {selectedReport.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  보고서를 선택해주세요
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {reports.length > 0 ? '위 목록에서 보고서를 선택하면 여기에 내용이 표시됩니다.' : '새 보고서를 생성해주세요.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
