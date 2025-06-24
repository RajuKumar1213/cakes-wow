import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review.models';
import Product from '@/models/Product.models';
import Order from '@/models/Order.models';
import mongoose from 'mongoose';

// GET - Fetch reviews for a product
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, rating_high, rating_low

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'rating_high':
        sortCriteria = { rating: -1, createdAt: -1 };
        break;
      case 'rating_low':
        sortCriteria = { rating: 1, createdAt: -1 };
        break;
      default: // newest
        sortCriteria = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Fetch reviews with pagination
    const reviews = await Review.find({
      productId: productId,
      isApproved: true
    })
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({
      productId: productId,
      isApproved: true
    });

    // Calculate review statistics
    const stats = await Review.aggregate([
      { 
        $match: { 
          productId: new mongoose.Types.ObjectId(productId),
          isApproved: true 
        } 
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingBreakdown: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0) {
      stats[0].ratingBreakdown.forEach(rating => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }

    const response = {
      success: true,
      data: {
        reviews: reviews.map(review => ({
          ...review,
          _id: review._id.toString(),
          productId: review.productId.toString(),
          userId: review.userId?.toString(),
          orderId: review.orderId?.toString()
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNextPage: page < Math.ceil(totalReviews / limit),
          hasPrevPage: page > 1
        },
        stats: {
          averageRating: stats.length > 0 ? Number(stats[0].averageRating.toFixed(1)) : 0,
          totalReviews,
          ratingDistribution
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      productId, 
      userId, 
      userName, 
      userEmail,
      rating, 
      title, 
      comment, 
      images = [],
      orderId,
      isVerifiedPurchase = false
    } = body;

    // Validation
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already reviewed this product from this specific order
    if (userId && orderId) {
      const existingReview = await Review.findOne({
        productId: productId,
        userId: userId,
        orderId: orderId
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product from this order' },
          { status: 400 }
        );
      }
    } else if (userId) {
      // Fallback: check if user already reviewed this product (without order specificity)
      const existingReview = await Review.findOne({
        productId: productId,
        userId: userId
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product' },
          { status: 400 }
        );
      }
    }

    // Verify purchase if orderId is provided
    let verifiedPurchase = isVerifiedPurchase;
    if (orderId && userId) {
      const order = await Order.findOne({
        _id: orderId,
        userId: userId,
        'items.productId': productId,
        status: { $in: ['delivered', 'completed'] }
      });
      
      verifiedPurchase = !!order;
    }

    const newReview = new Review({
      productId: productId,
      userId: userId || null,
      userName: userName || 'Anonymous',
      userEmail: userEmail || null,
      rating: Number(rating),
      title: title?.trim() || '',
      comment: comment.trim(),
      images: images || [],
      orderId: orderId || null,
      isVerifiedPurchase: verifiedPurchase,
      isApproved: true, // Auto-approve for now, can add moderation later
      helpfulCount: 0,
      reportCount: 0
    });

    const result = await newReview.save();

    // Update product rating statistics
    await updateProductRatingStats(productId);

    return NextResponse.json({
      success: true,
      data: {
        reviewId: result._id.toString(),
        message: 'Review submitted successfully'
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// Helper function to update product rating stats
async function updateProductRatingStats(productId) {
  try {
    const stats = await Review.aggregate([
      { 
        $match: { 
          productId: new mongoose.Types.ObjectId(productId),
          isApproved: true 
        } 
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(
        productId,
        {
          rating: Number(stats[0].averageRating.toFixed(1)),
          reviewCount: stats[0].totalReviews
        }
      );
    }
  } catch (error) {
    console.error('Error updating product rating stats:', error);
  }
}
