import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ApiResponse } from '@/types';
import { verifyToken } from '@/lib/auth';
import { getGoogleSheetsClient } from '@/lib/google-sheets';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
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

    // 사용자 정보 가져오기
    const usersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A2:K',
    });

    const users = usersResponse.data.values || [];
    const user = users.find(row => row[0] === userId);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다.',
      } as ApiResponse, { status: 404 });
    }

    const [, email, , , storeName, storeAddress, storeCategory, storeLatLng] = user;

    // 최근 7일간의 유동인구 데이터 가져오기
    const footTrafficResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FootTraffic!A2:E',
    });

    const footTrafficData = footTrafficResponse.data.values || [];

    // 사용자의 최근 7일 데이터 필터링
    const userFootTraffic = footTrafficData
      .filter(row => row[0] === userId)
      .slice(-7);

    // 보고서 생성을 위한 컨텍스트 구성
    const weeklyData = userFootTraffic.map(row => ({
      date: row[1],
      footTraffic: parseInt(row[2] || '0'),
    }));

    // 데이터 분석
    const footTrafficValues = weeklyData.map(d => d.footTraffic);
    const averageTraffic = footTrafficValues.length > 0
      ? Math.round(footTrafficValues.reduce((a, b) => a + b, 0) / footTrafficValues.length)
      : 0;
    const maxTraffic = Math.max(...footTrafficValues, 0);
    const minTraffic = Math.min(...footTrafficValues, 0);
    const trend = footTrafficValues.length >= 2
      ? footTrafficValues[footTrafficValues.length - 1] > footTrafficValues[0] ? '증가' : '감소'
      : '변화 없음';

    const reportContext = {
      storeName,
      storeAddress,
      storeCategory,
      weeklyData,
      averageTraffic,
      maxTraffic,
      minTraffic,
      trend,
    };

    // Claude API를 사용하여 보고서 생성
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `당신은 용인시 소상공인을 위한 경영 컨설턴트이자 데이터 분석 전문가입니다.
다음 데이터를 분석하여 실용적이고 실행 가능한 주간 보고서를 작성해주세요.

# 가게 정보
- **가게명**: ${storeName}
- **위치**: ${storeAddress}
- **업종**: ${storeCategory}

# 이번 주 유동인구 데이터 (최근 7일)
${reportContext.weeklyData.map(d => `- ${d.date}: **${d.footTraffic.toLocaleString()}명**`).join('\n')}

# 주요 지표
- 주간 평균: **${reportContext.averageTraffic.toLocaleString()}명/일**
- 최고 유동인구: **${reportContext.maxTraffic.toLocaleString()}명**
- 최저 유동인구: **${reportContext.minTraffic.toLocaleString()}명**
- 주간 트렌드: **${reportContext.trend}**

# 보고서 작성 지침

보고서는 반드시 다음 구조로 작성하되, **${storeCategory} 업종의 특성**을 고려하여 맞춤형 조언을 제공하세요:

## 1. 📊 이번 주 한눈에 보기 (Executive Summary)
- 2-3문장으로 이번 주 핵심 내용 요약
- 전주 대비 변화나 특이사항 언급

## 2. 🔍 데이터 분석 (Key Insights)
다음 관점에서 3-5개의 구체적인 인사이트 제공:
- 요일별 패턴 (주중/주말 차이)
- 피크 시간대 추정
- ${storeCategory} 업종 특성 반영
- 계절성이나 이벤트 영향 (추정 가능한 경우)

각 인사이트는 **왜 중요한지** 설명하세요.

## 3. 💡 실행 가능한 추천사항 (Action Items)
${storeCategory} 업종에 맞는 **구체적이고 즉시 실행 가능한** 3-4개 조언:
- 운영 시간 최적화
- 프로모션 타이밍
- 재고/인력 관리
- 고객 경험 개선

각 추천사항은:
- **무엇을**: 구체적인 행동
- **언제**: 실행 타이밍
- **기대효과**: 예상되는 이점

## 4. 📈 다음 주 전망 및 준비사항
- 유동인구 트렌드 예측 (증가/감소/유지)
- 특별히 주의할 날짜나 요일
- 사전 준비가 필요한 사항

---

**중요**:
- 데이터에 근거한 분석만 제시하세요
- 추측보다는 관찰된 패턴 중심으로 작성
- 소상공인이 쉽게 이해하고 실행할 수 있는 수준으로 작성
- 긍정적이면서도 현실적인 톤 유지
- 전문 용어는 쉽게 풀어서 설명

마크다운 형식으로 작성하되, 이모지를 적절히 활용하여 가독성을 높이세요.`,
        },
      ],
    });

    const reportContent = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // 보고서를 Google Sheets에 저장
    const reportId = `REPORT_${Date.now()}`;
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
          'weekly', // 보고서 타입
        ]],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reportId,
        content: reportContent,
        generatedAt: reportDate,
      },
    } as ApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('AI 보고서 생성 실패:', error);
    return NextResponse.json({
      success: false,
      error: 'REPORT_GENERATION_FAILED',
      message: 'AI 보고서 생성 중 오류가 발생했습니다.',
    } as ApiResponse, { status: 500 });
  }
}
