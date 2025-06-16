import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User.models';
import { verifyToken } from '@/lib/jwt';

// POST - Add new address
export async function POST(request) {
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

    const body = await request.json();
    const { receiverName, prefix, city, pinCode, fullAddress, phoneNumber, alternatePhoneNumber, addressType } = body;

    // Validate required fields
    if (!receiverName || !prefix || !city || !pinCode || !fullAddress || !phoneNumber || !addressType) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Find user and add address
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }    // Initialize address array if it doesn't exist or is not an array
    if (!user.address || !Array.isArray(user.address)) {
      console.log('Initializing address array for user...');
      user.address = [];
      await user.save();
    }

    console.log('Current user addresses count:', user.address.length);

    // Create new address object
    const newAddress = {
      receiverName: receiverName.trim(),
      prefix,
      city: city.trim(),
      pinCode: pinCode.trim(),
      fullAddress: fullAddress.trim(),
      phoneNumber: phoneNumber.trim(),
      alternatePhoneNumber: alternatePhoneNumber?.trim() || '',
      addressType
    };

    console.log('About to add address:', newAddress);
    
    // Add the new address to the existing array
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        $push: { address: newAddress }
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
      console.log('User updated successfully with new address');

    return NextResponse.json({
      message: 'Address added successfully',
      user: {
        id: updatedUser._id,
        phoneNumber: updatedUser.phoneNumber,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        address: updatedUser.address
      }
    });

  } catch (error) {
    console.error('Add address error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
