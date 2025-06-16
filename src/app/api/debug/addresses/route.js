import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User.models';
import { verifyToken } from '@/lib/jwt';

// GET - Debug address data
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Find user with all details
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('=== DEBUG USER DATA ===');
    console.log('User ID:', user._id);
    console.log('Phone:', user.phoneNumber);
    console.log('Address field type:', typeof user.address);
    console.log('Address is array:', Array.isArray(user.address));
    console.log('Address count:', user.address?.length || 0);
    console.log('Address data:', JSON.stringify(user.address, null, 2));

    return NextResponse.json({
      userId: user._id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      addressCount: user.address?.length || 0,
      addressType: typeof user.address,
      isArray: Array.isArray(user.address),
      addresses: user.address || []
    });

  } catch (error) {
    console.error('Debug address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
