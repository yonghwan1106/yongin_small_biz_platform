const fs = require('fs');
const readline = require('readline');
const path = require('path');

/**
 * 경기도 생활이동인구 CSV 파일 파싱 및 집계 스크립트
 *
 * 입력: docs/T26_GG_PURPOSE_TRANS_SEXAGE_DURATION_ADMI_INFLOW_202508_용인시.csv (787MB)
 * 출력: 집계된 JSON 파일 (날짜별, 시간대별, 행정동별 유동인구)
 */

// CSV 파일 경로
const CSV_FILE_PATH = path.join(__dirname, '../docs/T26_GG_PURPOSE_TRANS_SEXAGE_DURATION_ADMI_INFLOW_202508_용인시.csv');
const OUTPUT_FILE_PATH = path.join(__dirname, '../docs/aggregated-foot-traffic.json');

// 집계 데이터를 저장할 Map
// Key: "날짜|행정동명|시간대" (예: "20240113|동백동|13")
// Value: { date, district, hour, totalPopulation, count }
const aggregatedData = new Map();

// CSV 행 파싱 함수
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

// 데이터 집계 함수
function aggregateData(row) {
  // CSV 컬럼: 날짜, 요일, 시간대, 행정동코드, 시도명, 시군구명, 행정동명,
  //          중심_X좌표, 중심_Y좌표, 이동목적_코드, 이동목적_상세, 체류시간, 성별, 연령대, 인구수

  const date = row[0];          // 20240113
  const hour = row[2];          // 0-23
  const sigungu = row[5];       // 시군구명 (용인시 처인구, 용인시 기흥구, 용인시 수지구)
  const district = row[6];      // 행정동명 (동백동, 상현동 등)
  const centerX = row[7];       // 중심 X 좌표
  const centerY = row[8];       // 중심 Y 좌표
  const population = parseFloat(row[14] || 0); // 인구수

  // 용인시 데이터만 필터링
  if (!sigungu || !sigungu.includes('용인시')) {
    return;
  }

  // 집계 키 생성
  const key = `${date}|${district}|${hour}`;

  if (aggregatedData.has(key)) {
    const existing = aggregatedData.get(key);
    existing.totalPopulation += population;
    existing.count += 1;
  } else {
    aggregatedData.set(key, {
      date,
      district,
      hour: parseInt(hour),
      sigungu,
      centerX: parseFloat(centerX),
      centerY: parseFloat(centerY),
      totalPopulation: population,
      count: 1,
    });
  }
}

// 메인 처리 함수
async function processCSV() {
  console.log('🚀 경기도 생활이동인구 CSV 파싱 시작...');
  console.log(`📁 입력 파일: ${CSV_FILE_PATH}`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${CSV_FILE_PATH}`);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(CSV_FILE_PATH, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  let headerSkipped = false;

  for await (const line of rl) {
    lineNumber++;

    // 헤더 스킵
    if (!headerSkipped) {
      headerSkipped = true;
      console.log(`📋 헤더: ${line.substring(0, 100)}...`);
      continue;
    }

    // 진행 상황 출력 (10만 줄마다)
    if (lineNumber % 100000 === 0) {
      console.log(`⏳ 처리 중: ${lineNumber.toLocaleString()}줄 / 집계된 데이터: ${aggregatedData.size.toLocaleString()}건`);
    }

    try {
      const row = parseCSVLine(line);
      aggregateData(row);
    } catch (error) {
      console.error(`⚠️ 라인 ${lineNumber} 파싱 오류:`, error.message);
    }
  }

  console.log(`✅ CSV 파싱 완료: 총 ${lineNumber.toLocaleString()}줄 처리`);
  console.log(`📊 집계된 데이터: ${aggregatedData.size.toLocaleString()}건`);

  // Map을 Array로 변환하여 날짜/시간 순으로 정렬
  const aggregatedArray = Array.from(aggregatedData.values()).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.district !== b.district) return a.district.localeCompare(b.district);
    return a.hour - b.hour;
  });

  // 통계 정보
  const stats = {
    totalRecords: aggregatedArray.length,
    dateRange: {
      start: aggregatedArray[0]?.date,
      end: aggregatedArray[aggregatedArray.length - 1]?.date,
    },
    districts: [...new Set(aggregatedArray.map(d => d.district))].sort(),
    districtCount: new Set(aggregatedArray.map(d => d.district)).size,
    totalPopulation: aggregatedArray.reduce((sum, d) => sum + d.totalPopulation, 0),
    averagePopulationPerRecord: Math.round(
      aggregatedArray.reduce((sum, d) => sum + d.totalPopulation, 0) / aggregatedArray.length
    ),
  };

  console.log('\n📈 집계 통계:');
  console.log(`   - 전체 레코드: ${stats.totalRecords.toLocaleString()}건`);
  console.log(`   - 기간: ${stats.dateRange.start} ~ ${stats.dateRange.end}`);
  console.log(`   - 행정동 수: ${stats.districtCount}개`);
  console.log(`   - 총 유동인구: ${stats.totalPopulation.toLocaleString()}명`);
  console.log(`   - 레코드당 평균 유동인구: ${stats.averagePopulationPerRecord.toLocaleString()}명`);

  console.log('\n🏘️ 행정동 목록:');
  stats.districts.forEach((district, idx) => {
    console.log(`   ${idx + 1}. ${district}`);
  });

  // JSON 파일로 저장
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      sourceFile: path.basename(CSV_FILE_PATH),
      stats,
    },
    data: aggregatedArray,
  };

  console.log(`\n💾 JSON 파일 저장 중: ${OUTPUT_FILE_PATH}`);
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ JSON 파일 저장 완료 (${(fs.statSync(OUTPUT_FILE_PATH).size / 1024 / 1024).toFixed(2)} MB)`);

  // 샘플 데이터 출력
  console.log('\n📝 샘플 데이터 (처음 5건):');
  aggregatedArray.slice(0, 5).forEach((record, idx) => {
    console.log(`   ${idx + 1}. ${record.date} ${record.hour}시 | ${record.district} | ${record.totalPopulation.toFixed(2)}명`);
  });
}

// 스크립트 실행
processCSV()
  .then(() => {
    console.log('\n✅ 모든 작업 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  });
