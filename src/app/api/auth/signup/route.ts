import { NextRequest, NextResponse } from 'next/server';
import { UsersDB } from '@/lib/database';
import { hashPassword, validateEmail, validatePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { UserCreateInput, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: UserCreateInput = await request.json();
    const { email, password, agreements } = body;

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

    // 비밀번호 유효성 검증
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: passwordValidation.message,
      } as AuthResponse, { status: 400 });
    }

    // 필수 약관 동의 확인
    if (!agreements.terms || !agreements.privacy) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_AGREEMENTS',
        message: '필수 약관에 동의해주세요.',
      } as AuthResponse, { status: 400 });
    }

    // 기존 사용자 확인
    const existingUser = await UsersDB.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: '이미 가입된 이메일입니다.',
      } as AuthResponse, { status: 409 });
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const newUser = await UsersDB.create({
      email,
      passwordHash,
      marketingConsent: agreements.marketing || false,
    });

    // JWT 토큰 생성
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    return NextResponse.json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: newUser,
      message: '회원가입이 완료되었습니다.',
    } as AuthResponse, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    } as AuthResponse, { status: 500 });
  }
}
