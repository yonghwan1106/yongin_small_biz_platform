import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ApiResponse } from '@/types';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    // Cron Secret 인증
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
      } as ApiResponse, { status: 401 });
    }

    console.log('🤖 [Cron] 주간 보고서 생성 시작...');

    // Google Sheets 연결
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

    // 모든 활성 사용자 가져오기
    const usersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A2:K',
    });

    const users = usersResponse.data.values || [];
    console.log(`📊 [Cron] ${users.length}명의 사용자 발견`);

    // 유동인구 데이터 가져오기
    const footTrafficResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FootTraffic!A2:E',
    });

    const footTrafficData = footTrafficResponse.data.values || [];

    const results = {
      success: 0,
      failed: 0,
      total: users.length,
      errors: [] as string[],
    };

    // 각 사용자에 대해 보고서 생성
    for (const user of users) {
      const [userId, email, , , storeName, storeAddress, storeCategory] = user;

      if (!storeName) {
        console.log(`⏭️  [Cron] ${email}: 온보딩 미완료, 스킵`);
        continue;
      }

      try {
        console.log(`📝 [Cron] ${email} (${storeName}) 보고서 생성 중...`);

        // 사용자의 최근 7일 데이터 필터링
        const userFootTraffic = footTrafficData
          .filter(row => row[0] === userId)
          .slice(-7);

        if (userFootTraffic.length === 0) {
          console.log(`⚠️  [Cron] ${email}: 유동인구 데이터 없음, 스킵`);
          continue;
        }

        // 보고서 생성을 위한 컨텍스트 구성
        const reportContext = {
          storeName,
          storeAddress,
          storeCategory,
          weeklyData: userFootTraffic.map(row => ({
            date: row[1],
            footTraffic: parseInt(row[2] || '0'),
          })),
        };

        // Claude API를 사용하여 보고서 생성
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: `당신은 용인시 소상공인을 위한 데이터 분석 전문가입니다. 다음 데이터를 바탕으로 주간 보고서를 작성해주세요.

**가게 정보:**
- 가게명: ${storeName}
- 주소: ${storeAddress}
- 업종: ${storeCategory}

**최근 7일 유동인구 데이터:**
${reportContext.weeklyData.map(d => `- ${d.date}: ${d.footTraffic.toLocaleString()}명`).join('\n')}

**보고서 구성:**
1. **주간 요약**: 이번 주 유동인구 패턴의 주요 특징 (2-3문장)
2. **인사이트**: 데이터에서 발견한 중요한 패턴이나 트렌드 (3-4개 bullet points)
3. **실행 가능한 추천사항**: 구체적이고 실용적인 경영 조언 (3개 항목)
4. **다음 주 전망**: 예상되는 유동인구 트렌드

마크다운 형식으로 작성해주세요. 전문적이면서도 이해하기 쉽게 작성해주세요.`,
            },
          ],
        });

        const reportContent = message.content[0].type === 'text'
          ? message.content[0].text
          : '';

        // 보고서를 Google Sheets에 저장
        const reportId = `REPORT_${userId}_${Date.now()}`;
        const reportDate = new Date().toISOString();

        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Reports!A:E',
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              reportId,
              userId,
              reportDate,
              reportContent,
              'weekly',
            ]],
          },
        });

        console.log(`✅ [Cron] ${email}: 보고서 생성 완료`);
        results.success++;

      } catch (error: any) {
        console.error(`❌ [Cron] ${email}: 보고서 생성 실패`, error.message);
        results.failed++;
        results.errors.push(`${email}: ${error.message}`);
      }
    }

    console.log(`🎉 [Cron] 주간 보고서 생성 완료`);
    console.log(`   성공: ${results.success}개`);
    console.log(`   실패: ${results.failed}개`);

    return NextResponse.json({
      success: true,
      data: results,
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('❌ [Cron] 주간 보고서 생성 실패:', error);
    return NextResponse.json({
      success: false,
      error: 'CRON_JOB_FAILED',
      message: error.message,
    } as ApiResponse, { status: 500 });
  }
}
