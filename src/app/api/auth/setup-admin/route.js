import { NextResponse } from 'next/server';
import Admin from '@/models/Admin.models';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

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
    
    // Check if admin already exists
    const adminExists = await Admin.adminExists();
    
    if (adminExists) {
      return NextResponse.json({
        success: false,
        message: 'Admin account already exists. Only one admin is allowed.'
      }, { status: 400 });
    }
    
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Please provide a valid email address'
      }, { status: 400 });
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create admin
    const adminData = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isSuperAdmin: true
    };
    
    const admin = await Admin.createOrUpdateAdmin(adminData);
    
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        createdAt: admin.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating admin:', error);
    
    if (error.name === 'SingleAdminError') {
      return NextResponse.json({
        error: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to create admin account'
    }, { status: 500 });
  }
}

// GET method to check if admin exists
export async function GET() {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    const adminExists = await Admin.adminExists();
    const admin = adminExists ? await Admin.findOne({}).select('email createdAt') : null;
    
    return NextResponse.json({
      adminExists,
      admin: admin ? {
        email: admin.email,
        createdAt: admin.createdAt
      } : null
    });
    
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json({
      error: 'Failed to check admin status'
    }, { status: 500 });
  }
}
