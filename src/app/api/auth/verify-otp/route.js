import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User.models';
import Otp from '@/models/Otp.models';
import { generateToken } from '@/lib/jwt';
import { validatePhoneNumber, verifyOTPRobust, normalizePhoneNumber } from '@/lib/otp';

export async function POST(request) {
  try {
    const { phoneNumber, otp } = await request.json();

    console.log(`🔍 Verify OTP request for phone: ${phoneNumber}, OTP: ${otp}`);

    // Validate input
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      console.error(`❌ Invalid phone number format: ${phoneNumber}`);
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
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

    // Use the robust OTP verification function
    const verificationResult = await verifyOTPRobust(phoneNumber, otp, Otp);
    
    if (!verificationResult.success) {
      console.error(`❌ OTP verification failed: ${verificationResult.error}`);
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      );
    }

    const normalizedPhone = verificationResult.normalizedPhone;
    console.log(`✅ OTP verified successfully for ${normalizedPhone}`);

    // Find or create user
    let user = await User.findOne({ phoneNumber: normalizedPhone });
    
    if (!user) {
      console.log(`👤 Creating new user for ${normalizedPhone}`);
      // Create new user
      user = new User({
        phoneNumber: normalizedPhone,
        isVerified: true
      });
      await user.save();
      console.log(`✅ New user created: ${user._id}`);
    } else {
      console.log(`👤 Existing user found: ${user._id}`);
      // Update existing user
      user.isVerified = true;
      user.updatedAt = new Date();
      await user.save();
      console.log(`✅ User updated: ${user._id}`);
    }

    // Generate JWT token
    const token = generateToken(user._id);
    console.log(`🔐 JWT token generated for user: ${user._id}`);

    // Create response with token as cookie
    const response = NextResponse.json({
      message: 'OTP verified successfully',
      success: true,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified
      }
    });

    // Set HTTP-only cookie for security
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log(`✅ Complete OTP verification successful for ${normalizedPhone}`);
    return response;
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
