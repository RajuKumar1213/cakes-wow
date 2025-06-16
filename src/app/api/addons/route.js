import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AddOn from '@/models/AddOn.models';
import { uploadOnCloudinary, deleteFromCloudinary } from '@/helpers/uploadOnCloudinary';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import mongoose from 'mongoose';

// GET - Fetch all add-ons or single add-on by ID
export async function GET(request) {  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped",
        data: []
      });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch single add-on by ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid add-on ID' 
          },
          { status: 400 }
        );
      }

      const addOn = await AddOn.findById(id);

      if (!addOn) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Add-on not found' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: addOn
      });
    } else {
      // Fetch all add-ons
      const addOns = await AddOn.find({}).sort({ createdAt: -1 });
      
      return NextResponse.json({
        success: true,
        data: addOns
      });
    }
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch add-ons',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Create new add-on with image upload
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
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    const formData = await request.formData();
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const rating = formData.get('rating') ? parseFloat(formData.get('rating')) : 4.5;
    const imageFile = formData.get('image');

    // Validation
    if (!name || !price || !imageFile) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name, price, and image are required' 
        },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Price cannot be negative' 
        },
        { status: 400 }
      );
    }

    if (rating && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Rating must be between 0 and 5' 
        },
        { status: 400 }
      );
    }

    // Validate image file
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Only image files are allowed' 
        },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save file temporarily
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(imageFile.name);
    const fileName = `addon-${uniqueSuffix}${fileExtension}`;
    const tempFilePath = path.join(tempDir, fileName);
    
    await writeFile(tempFilePath, buffer);

    // Upload to Cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(tempFilePath);
    
    if (!cloudinaryResponse) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to upload image to Cloudinary' 
        },
        { status: 500 }
      );
    }

    // Create new add-on with Cloudinary URL
    const newAddOn = new AddOn({
      name: name.trim(),
      price,
      image: cloudinaryResponse.secure_url,
      rating
    });

    const savedAddOn = await newAddOn.save();

    return NextResponse.json({
      success: true,
      message: 'Add-on created successfully',
      data: savedAddOn
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating add-on:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validationErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create add-on',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update add-on by ID with optional image upload
export async function PATCH(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Add-on ID is required' 
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid add-on ID' 
        },
        { status: 400 }
      );
    }

    // Check if the add-on exists
    const existingAddOn = await AddOn.findById(id);
    if (!existingAddOn) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Add-on not found' 
        },
        { status: 404 }
      );
    }

    // Check if request contains FormData (image upload) or JSON
    const contentType = request.headers.get('content-type');
    let updateData = {};

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData with possible image upload
      const formData = await request.formData();
      const name = formData.get('name');
      const price = formData.get('price');
      const rating = formData.get('rating');
      const imageFile = formData.get('image');

      // Build update data
      if (name) updateData.name = name.trim();
      if (price) updateData.price = parseFloat(price);
      if (rating) updateData.rating = parseFloat(rating);

      // Handle image upload if provided
      if (imageFile && imageFile.size > 0) {
        // Validate image file
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Only image files are allowed' 
            },
            { status: 400 }
          );
        }

        // Create temp directory if it doesn't exist
        const tempDir = path.join(process.cwd(), 'public', 'temp');
        if (!existsSync(tempDir)) {
          await mkdir(tempDir, { recursive: true });
        }

        // Save file temporarily
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(imageFile.name);
        const fileName = `addon-${uniqueSuffix}${fileExtension}`;
        const tempFilePath = path.join(tempDir, fileName);
        
        await writeFile(tempFilePath, buffer);

        // Upload to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(tempFilePath);
        
        if (!cloudinaryResponse) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Failed to upload image to Cloudinary' 
            },
            { status: 500 }
          );
        }

        updateData.image = cloudinaryResponse.secure_url;

        // Delete old image from Cloudinary if it exists
        if (existingAddOn.image) {
          try {
            // Extract public_id from the URL
            const urlParts = existingAddOn.image.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            await deleteFromCloudinary(publicId);
          } catch (deleteError) {
            console.log('Error deleting old image:', deleteError);
            // Don't fail the update if old image deletion fails
          }
        }
      }
    } else {
      // Handle JSON data (no image upload)
      const body = await request.json();
      const { name, price, image, rating } = body;
      
      if (name !== undefined) updateData.name = name.trim();
      if (price !== undefined) updateData.price = price;
      if (image !== undefined) updateData.image = image;
      if (rating !== undefined) updateData.rating = rating;
    }

    // Validation
    if (updateData.price !== undefined && updateData.price < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Price cannot be negative' 
        },
        { status: 400 }
      );
    }

    if (updateData.rating !== undefined && (updateData.rating < 0 || updateData.rating > 5)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Rating must be between 0 and 5' 
        },
        { status: 400 }
      );
    }

    const updatedAddOn = await AddOn.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Add-on updated successfully',
      data: updatedAddOn
    });

  } catch (error) {
    console.error('Error updating add-on:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validationErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update add-on',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete add-on by ID with Cloudinary cleanup
export async function DELETE(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Add-on ID is required' 
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid add-on ID' 
        },
        { status: 400 }
      );
    }

    // Find the add-on first to get the image URL
    const addOn = await AddOn.findById(id);

    if (!addOn) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Add-on not found' 
        },
        { status: 404 }
      );
    }

    // Delete the add-on from database
    const deletedAddOn = await AddOn.findByIdAndDelete(id);

    // Delete image from Cloudinary if it exists
    if (addOn.image) {
      try {
        // Extract public_id from the URL
        const urlParts = addOn.image.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.log('Error deleting image from Cloudinary:', deleteError);
        // Don't fail the deletion if image cleanup fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Add-on deleted successfully',
      data: deletedAddOn
    });

  } catch (error) {
    console.error('Error deleting add-on:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete add-on',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
