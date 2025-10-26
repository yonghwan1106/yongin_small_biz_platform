const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createDemoAccount() {
  console.log('🎭 데모 계정 생성 시작...\n');

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
    // 데모 계정 정보
    const demoUser = {
      userId: 'DEMO_USER_001',
      email: 'demo@yongin-bizplatform.com',
      password: 'demo1234',
      storeName: '용인 맛집 카페',
      storeCategory: '카페',
      storeAddress: '경기도 용인시 수지구 신수로 767',
      storeLatLng: '37.3269,127.0978', // 용인시 수지구
    };

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(demoUser.password, 10);
    const createdAt = new Date().toISOString();

    console.log('📝 데모 계정 정보:');
    console.log(`   이메일: ${demoUser.email}`);
    console.log(`   비밀번호: ${demoUser.password}`);
    console.log(`   가게명: ${demoUser.storeName}`);
    console.log(`   주소: ${demoUser.storeAddress}\n`);

    // Users 시트에 데모 계정 추가
    console.log('💾 Users 시트에 데모 계정 추가 중...');
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Users!A:K',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          demoUser.userId,
          demoUser.email,
          passwordHash,
          demoUser.storeName,
          demoUser.storeCategory,
          demoUser.storeAddress,
          demoUser.storeLatLng,
          createdAt,
          createdAt, // lastLoginAt
          'TRUE', // isActive
          'TRUE', // marketingConsent
        ]],
      },
    });
    console.log('✅ 데모 계정 생성 완료\n');

    // 샘플 유동인구 데이터 생성 (최근 30일)
    console.log('📊 샘플 유동인구 데이터 생성 중...');
    const footTrafficData = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

      // 요일별 패턴 (주말이 더 많음)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseTraffic = isWeekend ? 3500 : 2500;

      // 시간대별 데이터 (아침, 점심, 저녁, 밤)
      const timeSlots = [
        { slot: '06-09시', traffic: baseTraffic * 0.3 },
        { slot: '09-12시', traffic: baseTraffic * 0.5 },
        { slot: '12-15시', traffic: baseTraffic * 0.8 },
        { slot: '15-18시', traffic: baseTraffic * 0.6 },
        { slot: '18-21시', traffic: baseTraffic * 0.9 },
        { slot: '21-24시', traffic: baseTraffic * 0.4 },
      ];

      timeSlots.forEach(({ slot, traffic }) => {
        const randomVariation = Math.random() * 0.3 - 0.15; // ±15% 변동
        const finalTraffic = Math.round(traffic * (1 + randomVariation));

        footTrafficData.push([
          demoUser.userId,
          dateStr,
          finalTraffic.toString(),
          slot,
          demoUser.storeLatLng,
        ]);
      });
    }

    // FootTraffic 시트에 데이터 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'FootTraffic!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: footTrafficData,
      },
    });
    console.log(`✅ ${footTrafficData.length}개의 유동인구 데이터 생성 완료\n`);

    // 샘플 AI 보고서 생성
    console.log('🤖 샘플 AI 보고서 생성 중...');
    const sampleReport = `# 주간 보고서 (샘플)

## 📊 주간 요약

이번 주 **용인 맛집 카페**의 유동인구는 평균 **2,850명**으로 전주 대비 **12.3% 증가**했습니다. 특히 주말(토, 일)에 높은 방문객 수를 기록했으며, 저녁 시간대(18-21시)가 가장 활발했습니다.

## 💡 주요 인사이트

- **주말 집중**: 토요일과 일요일의 유동인구가 평일 대비 40% 높게 나타남
- **저녁 시간대 강세**: 18-21시 사이 유동인구가 전체의 28%를 차지
- **점심 시간 안정적**: 12-15시 구간도 꾸준한 방문객 유지
- **성장 추세**: 지난 4주간 지속적인 상승세 (주간 평균 8% 증가)

## ✅ 실행 가능한 추천사항

### 1. 주말 특별 프로모션 강화
주말 방문객이 많으므로 토요일/일요일 한정 메뉴나 할인 이벤트를 기획하여 매출 극대화를 추천합니다.

### 2. 저녁 시간대 착석 최적화
18-21시 피크 타임에 대비한 좌석 회전율 개선과 테이크아웃 옵션 강화를 고려해보세요.

### 3. SNS 마케팅 집중
성장 추세를 유지하기 위해 인스타그램/블로그 후기 이벤트를 통한 온라인 마케팅을 강화하세요.

## 🔮 다음 주 전망

현재 상승 추세가 지속될 것으로 예상되며, 특히 다가오는 주말에 **3,200명 이상**의 방문객이 예상됩니다. 날씨가 좋을 경우 더 높은 수치도 가능합니다.

---

*이 보고서는 Anthropic Claude AI가 실제 유동인구 데이터를 분석하여 생성했습니다.*`;

    const reportId = `REPORT_${demoUser.userId}_${Date.now()}`;
    const reportDate = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Reports!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          reportId,
          demoUser.userId,
          reportDate,
          sampleReport,
          'weekly',
        ]],
      },
    });
    console.log('✅ 샘플 AI 보고서 생성 완료\n');

    console.log('🎉 데모 계정 및 샘플 데이터 생성 완료!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 로그인 정보');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`이메일:    ${demoUser.email}`);
    console.log(`비밀번호:  ${demoUser.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 다음 단계:');
    console.log('1. http://localhost:3000/login 접속');
    console.log('2. 위 계정 정보로 로그인');
    console.log('3. 대시보드에서 샘플 데이터 확인');
    console.log('4. AI 보고서 페이지에서 샘플 보고서 확인\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

createDemoAccount();
