import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp.models';
import { normalizePhoneNumber } from '@/lib/otp';

export async function GET(request) {
  // Only allow in development environment for security
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    let otpRecords;
    
    if (phoneNumber) {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      console.log(`🔍 Debugging OTP records for: ${phoneNumber} -> ${normalizedPhone}`);
      
      otpRecords = await Otp.find({ 
        phoneNumber: normalizedPhone 
      }).sort({ createdAt: -1 }).limit(10);
    } else {
      console.log(`🔍 Debugging all recent OTP records`);
      otpRecords = await Otp.find({}).sort({ createdAt: -1 }).limit(20);
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      totalRecords: otpRecords.length,
      searchPhone: phoneNumber,
      normalizedPhone: phoneNumber ? normalizePhoneNumber(phoneNumber) : null,
      records: otpRecords.map(record => ({
        id: record._id,
        phoneNumber: record.phoneNumber,
        otp: record.otp,
        createdAt: record.createdAt,
        isUsed: record.isUsed,
        attempts: record.attempts,
        ageSeconds: Math.floor((Date.now() - record.createdAt.getTime()) / 1000),
        isExpired: (Date.now() - record.createdAt.getTime()) > (10 * 60 * 1000)
      }))
    };

    console.log(`📊 OTP Debug Info:`, debugInfo);

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('❌ Debug OTP error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  // Only allow in development environment for security
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    if (phoneNumber) {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const deleteResult = await Otp.deleteMany({ phoneNumber: normalizedPhone });
      
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} OTP records for ${normalizedPhone}`);
      
      return NextResponse.json({
        message: `Deleted ${deleteResult.deletedCount} OTP records`,
        phoneNumber: normalizedPhone,
        deletedCount: deleteResult.deletedCount
      });
    } else {
      const deleteResult = await Otp.deleteMany({});
      
      console.log(`🗑️ Deleted all ${deleteResult.deletedCount} OTP records`);
      
      return NextResponse.json({
        message: `Deleted all OTP records`,
        deletedCount: deleteResult.deletedCount
      });
    }

  } catch (error) {
    console.error('❌ Debug OTP cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}
