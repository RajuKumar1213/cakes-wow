"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, CloudUpload, RotateCcw, Crop } from 'lucide-react';
import Image from 'next/image';
import CropModal from './CropModal';

interface PhotoCakeCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { image: File | null; imageUrl?: string; message: string }) => void;
  productName: string;
  initialData?: {
    image?: File | null;
    imageUrl?: string;
    message?: string;
  };
}

const PhotoCakeCustomization: React.FC<PhotoCakeCustomizationProps> = ({
  isOpen,
  onClose,
  onSave,
  productName,
  initialData
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(initialData?.image || null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const [croppedImage, setCroppedImage] = useState<string>(initialData?.imageUrl || '');
  const [message, setMessage] = useState(initialData?.message || '');
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [errors, setErrors] = useState<{ image?: string; message?: string }>({});
  const [imageScale, setImageScale] = useState(1);
  const [activeTab, setActiveTab] = useState<'upload' | 'message'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setSelectedImage(initialData.image || null);
      setImagePreview(initialData.imageUrl || '');
      setCroppedImage(initialData.imageUrl || '');
      setMessage(initialData.message || '');
      setActiveTab(initialData.imageUrl ? 'message' : 'upload');
    }
  }, [initialData]);

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Only png & jpg images.';
    }
    if (file.size > maxFileSize) {
      return 'File size should be 100kb to 10mb.';
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
    setImageScale(1);
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setShowCropModal(true);
    };

    reader.readAsDataURL(file);
  }, []);
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview('');
    setCroppedImage('');
    setImageScale(1);
    setShowCropModal(false);
    setActiveTab('upload');
  };
  const handleSave = async () => {
    setIsUploading(true);
    const newErrors: { image?: string; message?: string } = {};

    if (!selectedImage || !croppedImage) {
      newErrors.image = 'Please upload and crop an image for your photo cake.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsUploading(false);
      return;
    }

    try {
      // Convert cropped image data URL to File
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const croppedFile = new File([blob], selectedImage!.name, { type: selectedImage!.type });

      onSave({
        image: croppedFile,
        imageUrl: croppedImage,
        message: message.trim()
      });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      setErrors({ image: error instanceof Error ? error.message : 'Failed to save customization' });
    } finally {
      setIsUploading(false);
    }
  };
  const suggestedMessages = [
    "Happy Birthday",
    "John",
    "Sarah",
    "Happy Anniversary",
    "Mom",
    "Dad"
  ];
  // Crop Modal Component  // Crop Modal Component

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .range-slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
        }
        
        .range-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
      `}</style>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full my-4 sm:my-0 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col overflow-hidden">        {/* Header - Fixed */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Personalise your cake</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>{/* Content - Scrollable */}        <div className="p-3 sm:p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scroll-smooth">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 min-h-0">
            {/* Left Column - Cake Preview with Photo Frame */}
            <div className="flex flex-col items-center justify-center min-h-[250px] sm:min-h-[320px]">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full border-3 sm:border-4 border-yellow-300 shadow-lg overflow-hidden">
                {/* Cake decorative border */}
                <div className="absolute inset-1 sm:inset-2 border-2 sm:border-3 border-dotted border-yellow-400 rounded-full"></div>
                {/* Photo frame area */}
                <div className="absolute inset-5 sm:inset-7 bg-white rounded-full border-2 sm:border-3 border-red-400 overflow-hidden flex items-center justify-center">
                  {croppedImage ? (<div className="relative w-full h-full">
                    <Image
                      src={croppedImage}
                      alt="Cropped photo"
                      fill
                      className="object-cover"
                      style={{
                        transform: `scale(${imageScale})`,
                        transformOrigin: 'center'
                      }}
                    />
                  </div>
                  ) : selectedImage && imagePreview ? (                    <div className="text-center text-blue-600">
                      <Crop className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs">Crop image</p>
                    </div>
                  ) : (                    
                  <div className="text-center text-gray-400">
                      <Upload className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs">Upload Image</p>
                    </div>
                  )}
                </div>                {/* Cake text area */}
                {message && (
                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {message}
                  </div>
                )}

                {/* Decorative elements */}
                <div className="absolute top-1 left-2 w-2 h-2 sm:w-3 sm:h-3 bg-pink-300 rounded-full"></div>
                <div className="absolute top-3 right-4 w-2 h-2 bg-blue-300 rounded-full"></div>
                <div className="absolute bottom-4 left-3 w-3 h-3 sm:w-4 sm:h-4 bg-green-300 rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-purple-300 rounded-full"></div>

                {/* Birthday text */}
                <div className="absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 text-red-500 text-sm sm:text-base font-bold">
                  HAPPY
                </div>
                <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 text-red-500 text-sm sm:text-lg font-bold">
                  Birthday
                </div>
              </div>              {/* Image controls */}
              {croppedImage && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xs text-gray-600 min-w-[50px]">Resize</span>
                    <div className="flex-1 max-w-[200px]">                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={Math.round(imageScale * 100)}
                        onChange={(e) => setImageScale(Number(e.target.value) / 100)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                        style={{
                          background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((imageScale - 0.5) / 1.5) * 100}%, #e5e7eb ${((imageScale - 0.5) / 1.5) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 min-w-[35px] text-right">{Math.round(imageScale * 100)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setShowCropModal(true)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <Crop className="w-3 h-3" />
                      Re-crop
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>            {/* Right Column - Upload and Message */}
            <div className="space-y-3 sm:space-y-4">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Upload Image
                </button>
                <button
                  onClick={() => setActiveTab('message')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'message'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Cake Message
                </button>
              </div>              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-pink-300 rounded-lg p-3 sm:p-4 text-center bg-pink-50">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                        <CloudUpload className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-medium text-gray-800 mb-1">Upload Image</p>
                        <p className="text-xs text-gray-600">File size should be 100kb to 10mb. Only png & jpg images.</p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-4 py-1.5 bg-pink-500 text-white text-sm font-medium rounded-lg hover:bg-pink-600 transition-colors"
                        disabled={isUploading}
                      >
                        Choose File
                      </button>
                    </div>
                  </div>

                  {errors.image && (
                    <p className="text-sm text-red-600">{errors.image}</p>
                  )}                  {selectedImage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xs">✓</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-green-800">Image uploaded successfully</p>
                          <p className="text-xs text-green-600">{selectedImage.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message Tab */}
              {activeTab === 'message' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      disabled={isUploading}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Popular Names:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedMessages.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setMessage(suggestion)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors border"
                          disabled={isUploading}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>        </div>        {/* Footer - Fixed */}
        <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors order-2 sm:order-1 text-sm"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!croppedImage || isUploading}
            className="px-6 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 order-1 sm:order-2 text-sm"
          >
            {isUploading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save & Continue</span>
            )}
          </button>
        </div><input
          ref={fileInputRef}          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}        />
      </div>

      {/* Crop Modal */}
      <CropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={imagePreview}
        onSave={(croppedImageUrl) => {
          setCroppedImage(croppedImageUrl);
          setActiveTab('message');
        }}
      />
      </div>
    </>
  );
};

export default PhotoCakeCustomization;
