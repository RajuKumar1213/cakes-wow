"use client";

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Camera, MessageSquare, Image as ImageIcon, Sparkles, Heart } from 'lucide-react';
import Image from 'next/image';

interface PhotoCakeCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { image: File | null; imageUrl?: string; message: string }) => void;
  productName: string;
}

const PhotoCakeCustomization: React.FC<PhotoCakeCustomizationProps> = ({
  isOpen,
  onClose,
  onSave,
  productName
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ image?: string; message?: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a JPG, PNG, or WEBP image file.';
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 10MB.';
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, image: error }));
      return;
    }

    setSelectedImage(file);
    setErrors(prev => ({ ...prev, image: undefined }));
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    const newErrors: { image?: string; message?: string } = {};

    if (!selectedImage) {
      newErrors.image = 'Please upload an image for your photo cake.';
    }

    if (message.trim().length > 100) {
      newErrors.message = 'Message must be 100 characters or less.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsUploading(false);
      return;
    }

    try {
      // Upload image to server
      let uploadedImageUrl = '';
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);

        const uploadResponse = await fetch('/api/upload/photo-cake', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image');
        }

        uploadedImageUrl = uploadResult.imageUrl;
      }

      // Save the data with uploaded image URL
      onSave({ 
        image: selectedImage, 
        imageUrl: uploadedImageUrl,
        message: message.trim() 
      });
      
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ image: error instanceof Error ? error.message : 'Failed to upload image' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview('');
    setMessage('');
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const suggestedMessages = [
    "Happy Birthday! 🎂",
    "With Love ❤️",
    "Congratulations! 🎉",
    "Happy Anniversary! 💕",
    "Best Wishes! ✨",
    "Celebrate Life! 🌟"
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customize Your Photo Cake</h2>
                <p className="text-sm text-gray-600 mt-1">{productName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={isUploading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upload Your Photo</h3>
              <span className="text-red-500">*</span>
            </div>
            
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                isDragging
                  ? 'border-pink-400 bg-pink-50'
                  : errors.image
                  ? 'border-red-300 bg-red-50'
                  : selectedImage
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-pink-300 hover:bg-pink-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedImage && imagePreview ? (
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-48 h-48 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700">
                      ✓ Photo uploaded successfully!
                    </p>
                    <p className="text-xs text-gray-600">{selectedImage.name}</p>
                    <button
                      onClick={handleReset}
                      className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                      disabled={isUploading}
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-pink-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      Drop your photo here or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      JPG, PNG, or WEBP • Max 10MB
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-orange-600 text-white font-medium rounded-xl hover:from-pink-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photo
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {errors.image && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.image}</span>
              </p>
            )}
          </div>

          {/* Message Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Add a Message</h3>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>

            {/* Suggested Messages */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedMessages.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion)}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                    disabled={isUploading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your custom message here... (optional)"
                rows={3}
                maxLength={100}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors resize-none ${
                  errors.message
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
                }`}
                disabled={isUploading}
              />
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {message.length}/100 characters
                </div>
                {errors.message && (
                  <p className="text-xs text-red-600 flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">Tips for Best Results:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use high-resolution photos for better print quality</li>
                  <li>• Ensure faces are clearly visible and well-lit</li>
                  <li>• Avoid photos with busy backgrounds</li>
                  <li>• Portrait orientation works best for most cake designs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedImage || isUploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-orange-600 text-white font-medium rounded-xl hover:from-pink-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCakeCustomization;
