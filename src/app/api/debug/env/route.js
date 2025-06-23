// API endpoint to check environment variables and MongoDB connection
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NEXT_PHASE: process.env.NEXT_PHASE,
      HAS_MONGODB_URI: !!process.env.MONGODB_URI,
      HAS_NEXT_PUBLIC_API_URL: !!process.env.NEXT_PUBLIC_API_URL,
      timestamp: new Date().toISOString()
    };

    // Try to connect to MongoDB
    let dbStatus = 'unknown';
    let dbError = null;
    
    try {
      const conn = await dbConnect();
      if (conn.isConnectSkipped) {
        dbStatus = 'skipped (build time)';
      } else if (conn.error) {
        dbStatus = 'error';
        dbError = conn.error.message;
      } else {
        dbStatus = 'connected';
      }
    } catch (error) {
      dbStatus = 'error';
      dbError = error.message;
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      database: {
        status: dbStatus,
        error: dbError
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: !!process.env.VERCEL,
          HAS_MONGODB_URI: !!process.env.MONGODB_URI
        }
      },
      { status: 500 }
    );
  }
}
