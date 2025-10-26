import { NextRequest, NextResponse } from 'next/server';
import { UsersDB } from '@/lib/database';
import { extractTokenFromHeader, getUserFromToken } from '@/lib/auth';
import { UserUpdateInput, ApiResponse, User } from '@/types';

// GET /api/users/me - 현재 사용자 정보 조회
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
      } as ApiResponse, { status: 401 });
    }

    const tokenUser = getUserFromToken(token);
    if (!tokenUser) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_TOKEN',
        message: '유효하지 않은 토큰입니다.',
      } as ApiResponse, { status: 401 });
    }

    const user = await UsersDB.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다.',
      } as ApiResponse, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    } as ApiResponse<User>, { status: 200 });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다.',
    } as ApiResponse, { status: 500 });
  }
}

// PATCH /api/users/me - 현재 사용자 정보 수정
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '인증이 필요합니다.',
      } as ApiResponse, { status: 401 });
    }

    const tokenUser = getUserFromToken(token);
    if (!tokenUser) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_TOKEN',
        message: '유효하지 않은 토큰입니다.',
      } as ApiResponse, { status: 401 });
    }

    const updates: UserUpdateInput = await request.json();

    // 업데이트 허용 필드 검증
    const allowedFields = ['storeName', 'storeCategory', 'storeAddress', 'storeLatLng'];
    const updateKeys = Object.keys(updates);
    const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));

    if (invalidFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_FIELDS',
        message: `허용되지 않은 필드: ${invalidFields.join(', ')}`,
      } as ApiResponse, { status: 400 });
    }

    const updatedUser = await UsersDB.update(tokenUser.userId, updates);

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        error: 'UPDATE_FAILED',
        message: '사용자 정보 업데이트에 실패했습니다.',
      } as ApiResponse, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '사용자 정보가 업데이트되었습니다.',
    } as ApiResponse<User>, { status: 200 });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다.',
    } as ApiResponse, { status: 500 });
  }
}
