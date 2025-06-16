import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User.models';
import { verifyToken } from '@/lib/jwt';

// PUT - Update address
export async function PUT(request, { params }) {
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

    const { addressId } = params;
    const body = await request.json();
    const { receiverName, prefix, city, pinCode, fullAddress, phoneNumber, alternatePhoneNumber, addressType } = body;

    // Validate required fields
    if (!receiverName || !prefix || !city || !pinCode || !fullAddress || !phoneNumber || !addressType) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
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

    // Find user and update address
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the address to update
    const addressIndex = user.address.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Update address
    user.address[addressIndex] = {
      ...user.address[addressIndex],
      receiverName: receiverName.trim(),
      prefix,
      city: city.trim(),
      pinCode: pinCode.trim(),
      fullAddress: fullAddress.trim(),
      phoneNumber: phoneNumber.trim(),
      alternatePhoneNumber: alternatePhoneNumber?.trim() || '',
      addressType
    };

    await user.save();

    return NextResponse.json({
      message: 'Address updated successfully',
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name || '',
        email: user.email || '',
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete address
export async function DELETE(request, { params }) {
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

    const { addressId } = params;

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Find user and delete address
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the address to delete
    const addressIndex = user.address.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // Remove address
    user.address.splice(addressIndex, 1);
    await user.save();

    return NextResponse.json({
      message: 'Address deleted successfully',
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name || '',
        email: user.email || '',
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
