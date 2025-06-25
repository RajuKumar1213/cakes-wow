"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle
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
}

const ReviewsDisplay = ({ productId, currentUserId, triggerRefresh }: ReviewsDisplayProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: '12',
        sortBy: 'newest'
      });

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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (loading && currentPage === 1) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded mb-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Rating Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
        {stats.totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.averageRating.toFixed(1)} ({stats.totalReviews} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* Review Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm truncate">{review.userName}</span>
                    {review.isVerifiedPurchase && (
                      <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              {review.title && (
                <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-1">{review.title}</h4>
              )}

              {/* Review Content */}
              <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3">
                {review.comment}
              </p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2">
                  {review.images.slice(0, 2).map((image, index) => (
                    <div key={index} className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                      <Image
                        src={image}
                        alt={`Review image ${index + 1}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {review.images.length > 2 && (
                    <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-500 font-medium">
                        +{review.images.length - 2}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => fetchReviews(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => fetchReviews(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay;
