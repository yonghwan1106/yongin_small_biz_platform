import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

/**
 * Vercel Cron Job: 경기도 유동인구 데이터 자동 업데이트
 *
 * 스케줄: 매월 1일 오전 3시 (KST)
 * - vercel.json에서 cron 스케줄 설정
 * - CRON_SECRET 환경 변수로 보안 검증
 *
 * 작동 방식:
 * 1. 경기도 공공데이터 포털에서 최신 CSV 파일 다운로드 (수동)
 * 2. 로컬에서 parse-gyeonggi 스크립트 실행하여 집계
 * 3. 로컬에서 upload-gyeonggi 스크립트 실행하여 Google Sheets 업데이트
 *
 * 현재 버전: 수동 업데이트 트리거
 * TODO: 향후 경기도 API가 제공되면 완전 자동화
 */

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET(request: NextRequest) {
  try {
    // Cron Secret 검증
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('❌ CRON_SECRET not configured');
      return NextResponse.json({
        success: false,
        error: 'CRON_SECRET_NOT_CONFIGURED',
        message: 'Cron secret is not configured',
      }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Invalid cron secret');
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid authorization',
      }, { status: 401 });
    }

    console.log('🔄 Starting monthly Gyeonggi data update...');

    // Google Sheets 연결
    const sheets = await getGoogleSheetsClient();

    // GyeonggiFootTraffic 시트 존재 확인
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];

    if (!existingSheets.includes('GyeonggiFootTraffic')) {
      console.error('❌ GyeonggiFootTraffic sheet not found');
      return NextResponse.json({
        success: false,
        error: 'SHEET_NOT_FOUND',
        message: 'GyeonggiFootTraffic sheet does not exist',
      }, { status: 404 });
    }

    // 현재 데이터 통계 확인
    const currentDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'GyeonggiFootTraffic!A2:H',
    });

    const currentRows = currentDataResponse.data.values || [];
    const currentRecordCount = currentRows.length;

    // 날짜 범위 확인
    let dateRange = { start: 'N/A', end: 'N/A' };
    if (currentRows.length > 0) {
      const dates = currentRows.map(row => row[0]).filter(Boolean).sort();
      dateRange = {
        start: dates[0],
        end: dates[dates.length - 1],
      };
    }

    console.log('📊 Current data stats:');
    console.log(`   - Records: ${currentRecordCount.toLocaleString()}`);
    console.log(`   - Date range: ${dateRange.start} ~ ${dateRange.end}`);

    // 마지막 업데이트 기록 (별도 시트 또는 메타데이터 시트에 저장 가능)
    const now = new Date().toISOString();

    // UpdateLog 시트에 업데이트 기록 저장
    if (!existingSheets.includes('UpdateLog')) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'UpdateLog',
              },
            },
          }],
        },
      });

      // 헤더 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'UpdateLog!A1:E1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'timestamp',
            'type',
            'recordCount',
            'dateRangeStart',
            'dateRangeEnd',
          ]],
        },
      });
    }

    // 로그 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'UpdateLog!A2',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          now,
          'cron_check',
          currentRecordCount,
          dateRange.start,
          dateRange.end,
        ]],
      },
    });

    console.log('✅ Cron job completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        timestamp: now,
        currentRecordCount,
        dateRange,
        message: '현재는 수동 업데이트가 필요합니다. 경기도 공공데이터 포털에서 최신 CSV 파일을 다운로드한 후 npm run parse-gyeonggi && npm run upload-gyeonggi 명령어를 실행하세요.',
        instructions: [
          '1. 경기도 공공데이터 포털(data.gg.go.kr)에서 최신 CSV 다운로드',
          '2. docs/ 폴더에 CSV 파일 저장',
          '3. npm run parse-gyeonggi 실행',
          '4. npm run upload-gyeonggi 실행',
        ],
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json({
      success: false,
      error: 'CRON_JOB_FAILED',
      message: error.message || 'Cron job execution failed',
    }, { status: 500 });
  }
}
