import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { verifyToken } from '@/lib/auth';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
      } as ApiResponse, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_TOKEN',
        message: '유효하지 않은 토큰입니다.',
      } as ApiResponse, { status: 401 });
    }

    const userId = decoded.userId;

    // Google Sheets 연결
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    // 보고서 데이터 가져오기
    const reportsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Reports!A2:E',
    });

    const reports = reportsResponse.data.values || [];

    // 사용자의 보고서만 필터링
    const userReports = reports
      .filter(row => row[1] === userId)
      .map(row => ({
        reportId: row[0],
        generatedAt: row[2],
        content: row[3],
        type: row[4] || 'weekly',
      }))
      .reverse(); // 최신순 정렬

    return NextResponse.json({
      success: true,
      data: userReports,
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('보고서 목록 조회 실패:', error);
    return NextResponse.json({
      success: false,
      error: 'FETCH_REPORTS_FAILED',
      message: '보고서 목록 조회 중 오류가 발생했습니다.',
    } as ApiResponse, { status: 500 });
  }
}
