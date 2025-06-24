"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Star,
  Upload,
  X,
  Camera,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  orderId?: string;
  onReviewSubmitted?: () => void;
}

const ReviewModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  userId,
  userName,
  userEmail,
  orderId,
  onReviewSubmitted
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const maxFiles = 5;
    const currentTotal = images.length + files.length;
    
    if (currentTotal > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/reviews/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const newImageUrls = result.data.files.map((file: any) => file.url);
        setUploadedImages(prev => [...prev, ...newImageUrls]);
        setImages(prev => [...prev, ...Array.from(files)]);
      } else {
        setError(result.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    if (comment.trim().length < 10) {
      setError("Please write at least 10 characters in your review");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const reviewData = {
        productId,
        userId,
        userName,
        userEmail,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images: uploadedImages,
        orderId,
        isVerifiedPurchase: !!orderId
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onReviewSubmitted?.();
          onClose();
          resetForm();
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setTitle("");
    setComment("");
    setImages([]);
    setUploadedImages([]);
    setError("");
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {productImage && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={productImage}
                    alt={productName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                <p className="text-sm text-gray-600 truncate max-w-xs">{productName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {success ? (
          /* Success State */
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Review Submitted!</h3>
            <p className="text-gray-600">Thank you for your feedback. Your review will help other customers.</p>
          </div>
        ) : (
          /* Review Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                Rate this product *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {rating === 1 ? "Poor" : 
                     rating === 2 ? "Fair" : 
                     rating === 3 ? "Good" : 
                     rating === 4 ? "Very Good" : "Excellent"}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-gray-900 block">
                Review Title (Optional)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your review in a few words"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 text-right">{title.length}/100</div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-semibold text-gray-900 block">
                Your Review *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all h-32 resize-none"
                maxLength={1000}
                required
              />
              <div className="text-xs text-gray-500 text-right">{comment.length}/1000</div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                Add Photos (Optional)
              </label>
              <p className="text-xs text-gray-600">
                Help others by showing your experience with this product
              </p>
              
              {/* Upload Button */}
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={imageUrl}
                        alt={`Review image ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Add Photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500">
                Maximum 5 images, up to 5MB each. Supported: JPG, PNG, WebP
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
