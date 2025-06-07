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
    }    await dbConnect();

    // Find user and add address
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }    console.log('User address field type:', typeof user.address);
    console.log('User address field value:', user.address);
    console.log('Is address an array:', Array.isArray(user.address));

    // Always reset the address field to ensure it's a proper array
    console.log('Ensuring address field is a proper array...');
    await User.findByIdAndUpdate(
      decoded.userId,
      { $unset: { address: "" } },
      { strict: false }
    );
    
    await User.findByIdAndUpdate(
      decoded.userId,
      { $set: { address: [] } },
      { strict: false }
    );

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
    
    // Now safely add the address
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
