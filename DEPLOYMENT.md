# 배포 가이드

## Vercel 배포

### 1. Vercel 계정 준비

1. [Vercel](https://vercel.com) 가입
2. GitHub 연동

### 2. 프로젝트 배포

```bash
# Vercel CLI 설치 (선택사항)
npm install -g vercel

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

또는 Vercel Dashboard에서:
1. "New Project" 클릭
2. GitHub 저장소 선택
3. Framework Preset: Next.js 자동 선택
4. 환경 변수 설정 (아래 참조)
5. Deploy 클릭

### 3. 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables에서 다음 변수 추가:

#### Google Sheets API
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-api-service@big-unison-475903-p1.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1mlj3-YotMDPFETmQFBe_iVRegBYpBLhJNO0Qo7nWGXo
```

**중요**: `GOOGLE_PRIVATE_KEY`는 반드시 큰따옴표로 감싸고 `\n`을 그대로 유지해야 합니다.

#### 경기도 공공데이터 API
```
GYEONGGI_API_KEY=6e77d279fdae4dfc8c5299350015b2ab
```

#### Naver Maps API
```
NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID=11pz3tdpch
NAVER_MAPS_CLIENT_SECRET=your-secret
```

#### Anthropic Claude API
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

#### JWT & Security
```
JWT_SECRET=b986cc2ea935c75f8e85fb33be76b4a74b50a714fb9702734c263e247818c3bb
CRON_SECRET=prod_cron_secret_change_this
```

#### App URL
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Cron Job 설정

`vercel.json` 파일이 이미 설정되어 있어 자동으로 Cron Job이 활성화됩니다:

- **스케줄**: 매주 월요일 04:00 (UTC 기준, 한국 시간 13:00)
- **엔드포인트**: `/api/cron/weekly-reports`
- **인증**: `CRON_SECRET` 환경 변수로 보호

Vercel Dashboard → Settings → Crons에서 확인 가능합니다.

### 5. 도메인 설정 (선택사항)

1. Vercel Dashboard → Settings → Domains
2. 커스텀 도메인 추가
3. DNS 설정 (A 레코드 또는 CNAME)

### 6. 배포 확인

배포가 완료되면:

1. **https://your-app.vercel.app** 접속
2. 데모 계정으로 로그인:
   - 이메일: `demo@yongin-bizplatform.com`
   - 비밀번호: `demo1234`
3. 대시보드, AI 보고서, 프로필 페이지 확인

### 7. 문제 해결

#### 빌드 실패
- Vercel Dashboard → Deployments → 실패한 배포 클릭
- 빌드 로그 확인
- 환경 변수 누락 여부 확인

#### API 오류
- Vercel Dashboard → Functions → Logs
- 런타임 로그 확인
- Google Sheets 권한 확인

#### Cron Job 실행 안 됨
- Vercel Dashboard → Settings → Crons
- `CRON_SECRET` 환경 변수 확인
- `/api/cron/weekly-reports` 엔드포인트 테스트:
  ```bash
  curl -X GET https://your-app.vercel.app/api/cron/weekly-reports \
    -H "Authorization: Bearer your-cron-secret"
  ```

## 모니터링

### Vercel Analytics
- Vercel Dashboard → Analytics
- 페이지 뷰, 방문자 수 확인

### Vercel Logs
- Vercel Dashboard → Logs
- 실시간 로그 모니터링
- 에러 필터링

### Google Sheets 모니터링
- Google Sheets에서 직접 데이터 확인
- Reports 시트: AI 보고서 생성 확인
- Users 시트: 신규 가입자 확인

## 업데이트 배포

코드 변경 후:

```bash
git add .
git commit -m "Update message"
git push origin main
```

Vercel이 자동으로 새 버전을 배포합니다.

## 롤백

문제가 있을 경우:

1. Vercel Dashboard → Deployments
2. 이전 배포 버전 선택
3. "Promote to Production" 클릭

## 보안 체크리스트

- [ ] 모든 환경 변수가 Vercel에 설정됨
- [ ] `CRON_SECRET`이 강력한 값으로 변경됨
- [ ] `JWT_SECRET`이 32자 이상의 랜덤 문자열
- [ ] Google Sheets에 Service Account 권한 부여됨
- [ ] Naver Maps API 도메인 화이트리스트에 Vercel 도메인 추가
- [ ] 경기도 API 키가 유효함
- [ ] Anthropic API 키가 활성 상태
