require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

/**
 * 집계된 경기도 유동인구 데이터를 Google Sheets에 업로드하는 스크립트
 */

const AGGREGATED_DATA_FILE = path.join(__dirname, '../docs/aggregated-foot-traffic.json');
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const BATCH_SIZE = 1000; // 한 번에 업로드할 행 수

async function getGoogleSheetsClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient });
  } catch (error) {
    console.error('❌ Google Sheets 클라이언트 생성 실패:', error.message);
    throw error;
  }
}

async function ensureGyeonggiFootTrafficSheet(sheets) {
  console.log('📋 GyeonggiFootTraffic 시트 확인 중...');

  // 기존 시트 목록 가져오기
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const existingSheets = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];

  // GyeonggiFootTraffic 시트가 있으면 데이터 삭제
  if (existingSheets.includes('GyeonggiFootTraffic')) {
    console.log('⚠️ 기존 GyeonggiFootTraffic 시트 발견 - 데이터 삭제 중...');

    // 헤더를 제외한 모든 데이터 삭제
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'GyeonggiFootTraffic!A2:Z',
    });

    console.log('✅ 기존 데이터 삭제 완료');
  } else {
    // 시트 생성
    console.log('📝 GyeonggiFootTraffic 시트 생성 중...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'GyeonggiFootTraffic',
            },
          },
        }],
      },
    });
    console.log('✅ GyeonggiFootTraffic 시트 생성 완료');
  }

  // 헤더 설정
  console.log('📝 헤더 설정 중...');
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'GyeonggiFootTraffic!A1:H1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'date',          // 날짜 (20250801)
        'district',      // 행정동명 (동백동)
        'hour',          // 시간대 (0-23)
        'sigungu',       // 시군구명 (용인시 기흥구)
        'centerX',       // 중심 X 좌표
        'centerY',       // 중심 Y 좌표
        'totalPopulation', // 유동인구 합계
        'recordCount',   // 집계된 원본 레코드 수
      ]],
    },
  });
  console.log('✅ 헤더 설정 완료\n');
}

async function uploadDataToSheets(sheets, data) {
  console.log(`📤 데이터 업로드 시작 (총 ${data.length.toLocaleString()}건)...`);

  // 데이터를 Google Sheets 형식으로 변환
  const rows = data.map(record => [
    record.date,
    record.district,
    record.hour,
    record.sigungu,
    record.centerX,
    record.centerY,
    record.totalPopulation,
    record.count,
  ]);

  // 배치로 나누어 업로드 (append API 사용)
  const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, rows.length);
    const batch = rows.slice(start, end);

    console.log(`⏳ 배치 ${i + 1}/${totalBatches} 업로드 중 (${start + 1}-${end}행)...`);

    // append API를 사용하여 자동으로 시트 확장
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'GyeonggiFootTraffic!A2', // A2부터 추가 (A1은 헤더)
      valueInputOption: 'RAW',
      requestBody: {
        values: batch,
      },
    });
  }

  console.log(`✅ 데이터 업로드 완료 (${rows.length.toLocaleString()}행)\n`);
}

async function main() {
  console.log('🚀 경기도 유동인구 데이터 Google Sheets 업로드 시작\n');

  // 환경 변수 확인
  if (!SPREADSHEET_ID) {
    console.error('❌ GOOGLE_SHEET_ID 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ GOOGLE_PRIVATE_KEY 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  // 집계 데이터 파일 읽기
  console.log(`📂 집계 데이터 파일 읽기: ${AGGREGATED_DATA_FILE}`);

  if (!fs.existsSync(AGGREGATED_DATA_FILE)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${AGGREGATED_DATA_FILE}`);
    console.error('먼저 npm run parse-gyeonggi를 실행하여 데이터를 집계하세요.');
    process.exit(1);
  }

  const aggregatedData = JSON.parse(fs.readFileSync(AGGREGATED_DATA_FILE, 'utf-8'));

  console.log('📊 데이터 정보:');
  console.log(`   - 총 레코드: ${aggregatedData.metadata.stats.totalRecords.toLocaleString()}건`);
  console.log(`   - 기간: ${aggregatedData.metadata.stats.dateRange.start} ~ ${aggregatedData.metadata.stats.dateRange.end}`);
  console.log(`   - 행정동 수: ${aggregatedData.metadata.stats.districtCount}개`);
  console.log(`   - 총 유동인구: ${Math.round(aggregatedData.metadata.stats.totalPopulation).toLocaleString()}명\n`);

  // Google Sheets 클라이언트 생성
  const sheets = await getGoogleSheetsClient();
  console.log('✅ Google Sheets 연결 성공\n');

  // GyeonggiFootTraffic 시트 준비
  await ensureGyeonggiFootTrafficSheet(sheets);

  // 데이터 업로드
  await uploadDataToSheets(sheets, aggregatedData.data);

  console.log('🎉 모든 작업 완료!');
  console.log(`📊 Google Sheets URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
  console.log('\n다음 단계:');
  console.log('1. Google Sheets에서 GyeonggiFootTraffic 시트 확인');
  console.log('2. API 엔드포인트 업데이트하여 실제 데이터 사용');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  });
