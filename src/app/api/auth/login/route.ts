import { NextRequest, NextResponse } from 'next/server';
import { UsersDB } from '@/lib/database';
import { verifyPassword, generateAccessToken, generateRefreshToken, validateEmail } from '@/lib/auth';
import { LoginCredentials, AuthResponse } from '@/types';

// 로그인 실패 추적 (간단한 in-memory 저장, 프로덕션에서는 Redis 등 사용)
const loginAttempts: Map<string, { count: number; lockUntil: number }> = new Map();

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION = 5 * 60 * 1000; // 5분

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password, rememberMe } = body;

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_FIELDS',
        message: '이메일과 비밀번호를 입력해주세요.',
      } as AuthResponse, { status: 400 });
    }

    // 이메일 유효성 검증
    if (!validateEmail(email)) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_EMAIL',
        message: '유효하지 않은 이메일 형식입니다.',
      } as AuthResponse, { status: 400 });
    }

    // 로그인 시도 횟수 확인
    const attempts = loginAttempts.get(email);
    if (attempts && attempts.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((attempts.lockUntil - Date.now()) / 60000);
      return NextResponse.json({
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: `로그인 시도 횟수를 초과했습니다. ${remainingMinutes}분 후에 다시 시도해주세요.`,
      } as AuthResponse, { status: 429 });
    }

    // 사용자 조회
    const user = await UsersDB.findByEmail(email);
    if (!user) {
      // 실패 횟수 증가
      incrementLoginAttempts(email);

      return NextResponse.json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 일치하지 않습니다.',
      } as AuthResponse, { status: 401 });
    }

    // 비밀번호 검증
    const passwordHash = await UsersDB.getPasswordHash(user.userId);
    if (!passwordHash) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 일치하지 않습니다.',
      } as AuthResponse, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, passwordHash);

    if (!isPasswordValid) {
      // 실패 횟수 증가
      incrementLoginAttempts(email);

      return NextResponse.json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 일치하지 않습니다.',
      } as AuthResponse, { status: 401 });
    }

    // 로그인 성공 시 시도 횟수 초기화
    loginAttempts.delete(email);

    // 마지막 로그인 시간 업데이트
    await UsersDB.update(user.userId, {
      lastLoginAt: new Date().toISOString(),
    });

    // JWT 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = rememberMe ? generateRefreshToken(user) : undefined;

    return NextResponse.json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        storeName: user.storeName,
        storeCategory: user.storeCategory,
        storeAddress: user.storeAddress,
        storeLatLng: user.storeLatLng,
      },
      message: '로그인 성공',
    } as AuthResponse, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    } as AuthResponse, { status: 500 });
  }
}

// 로그인 실패 횟수 증가
function incrementLoginAttempts(email: string) {
  const attempts = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  attempts.count += 1;

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockUntil = Date.now() + LOCK_DURATION;
  }

  loginAttempts.set(email, attempts);
}
