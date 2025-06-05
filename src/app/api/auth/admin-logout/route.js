import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Admin logged out successfully',
      success: true
    });

    // Clear the admin authentication cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
