import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToCloudinary } from '@/helpers/uploadOnCloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, or WEBP images only.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const filename = `photo_cake_${timestamp}_${originalName}`;

    // Upload to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(buffer, filename);

    if (!uploadResult) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }    // Return the secure URL
    return NextResponse.json({
      success: true,
      imageUrl: (uploadResult as any)?.secure_url,
      publicId: (uploadResult as any)?.public_id
    });

  } catch (error) {
    console.error('Photo cake upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}
