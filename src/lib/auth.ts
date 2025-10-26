import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 비밀번호 검증
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT Access Token 생성
export function generateAccessToken(user: Pick<User, 'userId' | 'email'>): string {
  const payload: JWTPayload = {
    userId: user.userId,
    email: user.email,
    type: 'access',
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// JWT Refresh Token 생성
export function generateRefreshToken(user: Pick<User, 'userId' | 'email'>): string {
  const payload: JWTPayload = {
    userId: user.userId,
    email: user.email,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

// JWT Token 검증
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// 비밀번호 강도 검증
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: '비밀번호는 최소 1개 이상의 영문자를 포함해야 합니다.' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: '비밀번호는 최소 1개 이상의 숫자를 포함해야 합니다.' };
  }

  return { valid: true };
}

// 이메일 유효성 검증
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Authorization 헤더에서 토큰 추출
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

// 토큰에서 사용자 정보 추출
export function getUserFromToken(token: string): Pick<User, 'userId' | 'email'> | null {
  const payload = verifyToken(token);
  if (!payload || payload.type !== 'access') {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
  };
}
