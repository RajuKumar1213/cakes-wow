import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp.models';
import { generateOTP, sendOTP, validatePhoneNumber, checkRateLimit } from '@/lib/otp';

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    // Validate input
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
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

    // Check rate limiting
    const rateLimit = checkRateLimit(phoneNumber);
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime);
      return NextResponse.json(
        { 
          error: 'Too many OTP requests. Please try again later.',
          resetTime: resetTime.toISOString()
        },
        { status: 429 }
      );
    }

    await dbConnect();

    // Generate OTP
    const otp = generateOTP();

    // Remove any existing OTP for this phone number
    await Otp.deleteMany({ phoneNumber });

    // Save new OTP
    const otpDoc = new Otp({
      phoneNumber,
      otp
    });
    await otpDoc.save();

    // Send OTP via SMS
    const smsResult = await sendOTP(phoneNumber, otp);
    
    if (!smsResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      success: true
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
