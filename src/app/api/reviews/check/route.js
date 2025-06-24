import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review.models';
import mongoose from 'mongoose';

// GET - Check if user has already reviewed a product from a specific order
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    let query = { productId: productId };

    // If userId and orderId are provided, check for specific order review
    if (userId && orderId) {
      query.userId = userId;
      query.orderId = orderId;
    } else if (userId) {
      // Fallback: check if user has reviewed this product at all
      query.userId = userId;
    }

    const existingReview = await Review.findOne(query);

    return NextResponse.json({
      success: true,
      data: {
        hasReviewed: !!existingReview,
        reviewId: existingReview?._id?.toString() || null
      }
    });

  } catch (error) {
    console.error('Error checking review status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check review status' },
      { status: 500 }
    );
  }
}
