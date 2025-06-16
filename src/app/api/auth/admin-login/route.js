import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '@/models/Admin.models';
import dbConnect from '@/lib/mongodb';

export async function POST(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    const { email, password } = await request.json();


    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get the single admin from database
    const admin = await Admin.getSingleAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin account not found. Please contact system administrator.' },
        { status: 404 }
      );
    }

    // Check email
    if (email !== admin.email) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password (assuming password is hashed in database)
    // If password is not hashed yet, we'll do a direct comparison for now
    let passwordMatch = false;
    
    try {
      // Try bcrypt comparison first (for hashed passwords)
      passwordMatch = await bcrypt.compare(password, admin.password);
    } catch (error) {
      // If bcrypt fails, do direct comparison (for plain text passwords)
      // This is for backward compatibility
      passwordMatch = password === admin.password;
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin._id,
        email: admin.email,
        role: 'admin',
        type: 'admin_session'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: admin._id,
        email: admin.email,
        role: 'admin'
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
