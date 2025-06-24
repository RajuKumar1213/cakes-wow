import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review.models';
import mongoose from 'mongoose';

// POST - Handle review actions (helpful, report)
export async function POST(request) {
  try {
    const body = await request.json();
    const { reviewId, action, userId } = body;

    // Validation
    if (!reviewId || !action) {
      return NextResponse.json(
        { success: false, error: 'Review ID and action are required' },
        { status: 400 }
      );
    }

    if (!['helpful', 'report'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "helpful" or "report"' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    let updateData = {};
    let message = '';

    if (action === 'helpful') {
      // Check if user already marked as helpful
      if (userId && review.helpfulBy && review.helpfulBy.includes(userId)) {
        return NextResponse.json(
          { success: false, error: 'You have already marked this review as helpful' },
          { status: 400 }
        );
      }

      // Add to helpful count and track user
      updateData.$inc = { helpfulCount: 1 };
      if (userId) {
        updateData.$addToSet = { helpfulBy: userId };
      }
      message = 'Review marked as helpful';

    } else if (action === 'report') {
      // Check if user already reported
      if (userId && review.reportedBy && review.reportedBy.includes(userId)) {
        return NextResponse.json(
          { success: false, error: 'You have already reported this review' },
          { status: 400 }
        );
      }

      // Add to report count and track user
      updateData.$inc = { reportCount: 1 };
      if (userId) {
        updateData.$addToSet = { reportedBy: userId };
      }
      message = 'Review reported';

      // Auto-hide review if it gets too many reports (e.g., 5 reports)
      if (review.reportCount >= 4) { // This will be the 5th report
        updateData.$set = { isApproved: false };
        message = 'Review reported and hidden due to multiple reports';
      }
    }

    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        message,
        helpfulCount: updatedReview.helpfulCount,
        reportCount: updatedReview.reportCount,
        isApproved: updatedReview.isApproved
      }
    });

  } catch (error) {
    console.error('Error processing review action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
