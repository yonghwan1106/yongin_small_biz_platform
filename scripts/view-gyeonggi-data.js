require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function viewGyeonggiData() {
  console.log('📊 경기도 유동인구 데이터 조회\n');

  // Google Sheets 연결
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // 데이터 가져오기 (처음 10개만)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'GyeonggiFootTraffic!A1:H11',
  });

  const rows = response.data.values || [];

  if (rows.length === 0) {
    console.log('❌ 데이터가 없습니다.');
    return;
  }

  // 헤더
  console.log('=' .repeat(100));
  const header = rows[0];
  console.log(header.join(' | '));
  console.log('=' .repeat(100));

  // 데이터 (처음 10줄)
  for (let i = 1; i < rows.length; i++) {
    console.log(rows[i].join(' | '));
  }

  console.log('=' .repeat(100));
  console.log(`\n✅ 총 ${rows.length - 1}개 레코드 표시 (전체: 29,016건)`);
  console.log(`\n📊 Google Sheets URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
}

viewGyeonggiData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  });
