"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  ThumbsUp,
  Flag,
  ChevronDown,
  Filter,
  CheckCircle,
  Calendar,
  MoreHorizontal
} from "lucide-react";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reportCount: number;
  createdAt: string;
}

interface ReviewsDisplayProps {
  productId: string;
  currentUserId?: string;
  triggerRefresh?: number;
  onWriteReview?: () => void;
}

const ReviewsDisplay = ({ productId, currentUserId, triggerRefresh, onWriteReview }: ReviewsDisplayProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [actioningReview, setActioningReview] = useState<string | null>(null);

  const fetchReviews = async (page = 1, sort = sortBy, rating = filterRating) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: '10',
        sortBy: sort
      });

      if (rating !== 'all') {
        params.append('rating', rating);
      }

      const response = await fetch(`/api/reviews?${params}`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data.reviews);
        setStats(result.data.stats);
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, triggerRefresh]);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    fetchReviews(1, newSort, filterRating);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterRating(newFilter);
    fetchReviews(1, sortBy, newFilter);
  };

  const handleReviewAction = async (reviewId: string, action: 'helpful' | 'report') => {
    if (!currentUserId) {
      alert('Please log in to perform this action');
      return;
    }

    setActioningReview(reviewId);
    
    try {
      const response = await fetch('/api/reviews/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewId,
          action,
          userId: currentUserId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update the review in local state
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { 
                ...review, 
                helpfulCount: action === 'helpful' ? review.helpfulCount + 1 : review.helpfulCount,
                reportCount: action === 'report' ? review.reportCount + 1 : review.reportCount
              }
            : review
        ));
      } else {
        alert(result.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Action failed');
    } finally {
      setActioningReview(null);
    }
  };

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getRatingPercentage = (rating: number) => {
    return stats.totalReviews > 0 
      ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 
      : 0;
  };

  if (loading && currentPage === 1) {
    return (
      <div className="space-y-4">
        {/* Rating summary skeleton */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-4 border-2 border-yellow-200 animate-pulse">
          <div className="h-6 bg-yellow-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-8 bg-yellow-200 rounded w-1/2"></div>
              <div className="h-4 bg-yellow-200 rounded w-3/4"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-yellow-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Reviews skeleton */}
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-4 sm:p-6 border-2 border-yellow-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          Customer Reviews
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-3xl font-black text-yellow-600">
                {stats.averageRating.toFixed(1)}
              </span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-gray-600">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  ></div>
                </div>                <span className="w-12 text-xs text-gray-500 text-right">
                  {stats.ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Write Review Button - Only show if callback provided */}
        {onWriteReview && (
          <div className="mt-6 text-center">
            <button
              onClick={onWriteReview}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2 mx-auto"
            >
              <Star className="w-4 h-4" />
              ✨ Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      {stats.totalReviews > 0 && (
        <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-wrap gap-3">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <span className="text-sm text-gray-600">
            Showing {reviews.length} of {stats.totalReviews} reviews
          </span>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">Be the first to share your experience with this product!</p>
          </div>
        ) : (
          reviews.map((review) => {
            const isExpanded = expandedReviews.has(review._id);
            const shouldTruncate = review.comment.length > 300;
            
            return (
              <div key={review._id} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{review.userName}</span>
                        {review.isVerifiedPurchase && (
                          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Verified Purchase
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                )}

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {shouldTruncate && !isExpanded 
                      ? `${review.comment.substring(0, 300)}...`
                      : review.comment
                    }
                  </p>
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleReviewExpansion(review._id)}
                      className="text-pink-600 hover:text-pink-700 text-sm font-medium mt-2 flex items-center gap-1"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={image}
                          alt={`Review image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleReviewAction(review._id, 'helpful')}
                      disabled={actioningReview === review._id}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpfulCount})
                    </button>
                    
                    <button
                      onClick={() => handleReviewAction(review._id, 'report')}
                      disabled={actioningReview === review._id}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <button
            onClick={() => fetchReviews(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => fetchReviews(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay;
