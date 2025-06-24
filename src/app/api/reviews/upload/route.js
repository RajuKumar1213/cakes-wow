import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;

    if (files.length > maxFiles) {
      return NextResponse.json(
        { success: false, error: `Maximum ${maxFiles} images allowed` },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews');

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Add to uploaded files array
      uploadedFiles.push({
        originalName: file.name,
        fileName: fileName,
        url: `/uploads/reviews/${fileName}`,
        size: file.size,
        type: file.type
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        files: uploadedFiles,
        message: `${uploadedFiles.length} file(s) uploaded successfully`
      }
    });

  } catch (error) {
    console.error('Error uploading review images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
