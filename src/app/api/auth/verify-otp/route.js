import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User.models';
import Otp from '@/models/Otp.models';
import { generateToken } from '@/lib/jwt';
import { validatePhoneNumber } from '@/lib/otp';

export async function POST(request) {
  try {
    const { phoneNumber, otp } = await request.json();

    // Validate input
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the OTP record
    const otpRecord = await Otp.findOne({ phoneNumber, otp });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired (should be handled by MongoDB TTL, but double-check)
    const now = new Date();
    const otpAge = now - otpRecord.createdAt;
    if (otpAge > 5 * 60 * 1000) { // 5 minutes
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // OTP is valid, delete it
    await Otp.deleteOne({ _id: otpRecord._id });

    // Find or create user
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // Create new user
      user = new User({
        phoneNumber,
        isVerified: true
      });
      await user.save();
    } else {
      // Update existing user
      user.isVerified = true;
      user.updatedAt = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

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

    return response;

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
