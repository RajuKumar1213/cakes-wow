import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp.models';
import { generateOTP, sendOTP, validatePhoneNumber, checkRateLimit, normalizePhoneNumber } from '@/lib/otp';

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    console.log(`🔄 Send OTP request for: ${phoneNumber}`);

    // Validate input
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      console.error(`❌ Invalid phone number format: ${phoneNumber}`);
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    console.log(`📱 Normalized phone: ${normalizedPhone}`);

    // Check rate limiting
    const rateLimit = checkRateLimit(normalizedPhone);
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime);
      console.log(`⚠️ Rate limit exceeded for ${normalizedPhone}`);
      return NextResponse.json(
        { 
          error: 'Too many OTP requests. Please try again later.',
          resetTime: resetTime.toISOString()
        },
        { status: 429 }
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

    // Generate OTP
    const otp = generateOTP();
    console.log(`🔢 Generated OTP: ${otp} for ${normalizedPhone}`);

    // Remove any existing OTP for this phone number
    const deleteResult = await Otp.deleteMany({ phoneNumber: normalizedPhone });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing OTP records for ${normalizedPhone}`);

    // Save new OTP
    const otpDoc = new Otp({
      phoneNumber: normalizedPhone,
      otp,
      attempts: 0,
      isUsed: false
    });
    
    const savedOtp = await otpDoc.save();
    console.log(`💾 Saved new OTP record:`, {
      id: savedOtp._id,
      phone: savedOtp.phoneNumber,
      otp: savedOtp.otp,
      createdAt: savedOtp.createdAt
    });

    // Send OTP via WhatsApp
    const whatsappResult = await sendOTP(normalizedPhone, otp);
    
    if (!whatsappResult.success) {
      console.error(`❌ Failed to send OTP via WhatsApp:`, whatsappResult.error);
      
      // If WhatsApp sending fails, clean up the saved OTP
      await Otp.deleteMany({ phoneNumber: normalizedPhone });
      
      return NextResponse.json(
        { 
          error: 'Failed to send OTP via WhatsApp. Please try again.',
          details: whatsappResult.error 
        },
        { status: 500 }
      );
    }

    console.log(`✅ OTP sent successfully to ${normalizedPhone}`);

    return NextResponse.json({
      message: 'OTP sent successfully',
      success: true,
      phoneNumber: normalizedPhone
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
      