const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function initializeSheets() {
  console.log('🚀 Google Sheets 초기화 시작...\n');

  // 환경 변수 확인
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL이 설정되지 않았습니다.');
    process.exit(1);
  }
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ GOOGLE_PRIVATE_KEY가 설정되지 않았습니다.');
    process.exit(1);
  }
  if (!process.env.GOOGLE_SHEET_ID) {
    console.error('❌ GOOGLE_SHEET_ID가 설정되지 않았습니다.');
    process.exit(1);
  }

  console.log('✅ 환경 변수 확인 완료');
  console.log(`   Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
  console.log(`   Sheet ID: ${process.env.GOOGLE_SHEET_ID}\n`);

  // Google Sheets API 인증
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  try {
    // 기존 시트 목록 확인
    console.log('📋 기존 시트 확인 중...');
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log(`   기존 시트: ${existingSheets.join(', ')}\n`);

    // Users 시트 생성 또는 업데이트
    if (!existingSheets.includes('Users')) {
      console.log('📝 Users 시트 생성 중...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Users',
              },
            },
          }],
        },
      });
      console.log('✅ Users 시트 생성 완료');
    }

    console.log('📝 Users 시트 헤더 설정 중...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Users!A1:K1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'userId',
          'email',
          'passwordHash',
          'storeName',
          'storeCategory',
          'storeAddress',
          'storeLatLng',
          'createdAt',
          'lastLoginAt',
          'isActive',
          'marketingConsent',
        ]],
      },
    });
    console.log('✅ Users 시트 헤더 설정 완료\n');

    // Reports 시트 생성 또는 업데이트
    if (!existingSheets.includes('Reports')) {
      console.log('📝 Reports 시트 생성 중...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Reports',
              },
            },
          }],
        },
      });
      console.log('✅ Reports 시트 생성 완료');
    }

    console.log('📝 Reports 시트 헤더 설정 중...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Reports!A1:E1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'reportId',
          'userId',
          'generatedAt',
          'content',
          'type',
        ]],
      },
    });
    console.log('✅ Reports 시트 헤더 설정 완료\n');

    // FootTraffic 시트 생성 또는 업데이트
    if (!existingSheets.includes('FootTraffic')) {
      console.log('📝 FootTraffic 시트 생성 중...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'FootTraffic',
              },
            },
          }],
        },
      });
      console.log('✅ FootTraffic 시트 생성 완료');
    }

    console.log('📝 FootTraffic 시트 헤더 설정 중...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'FootTraffic!A1:E1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'userId',
          'date',
          'footTraffic',
          'timeSlot',
          'location',
        ]],
      },
    });
    console.log('✅ FootTraffic 시트 헤더 설정 완료\n');

    console.log('🎉 Google Sheets 초기화 완료!');
    console.log(`\n📊 Sheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    console.log('\n다음 단계:');
    console.log('1. node scripts/create-demo-account.js - 데모 계정 생성');
    console.log('2. http://localhost:3000/signup 에서 회원가입');
    console.log('3. Google Sheets에서 데이터 확인');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (error.code === 403) {
      console.error('\n해결 방법:');
      console.error('1. Google Sheet를 Service Account에 공유했는지 확인');
      console.error(`2. ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL} 에게 편집 권한 부여`);
      console.error(`3. Sheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    }
    process.exit(1);
  }
}

initializeSheets();
