"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload, CloudUpload, RotateCcw, Crop } from "lucide-react";
import Image from "next/image";
import CropModal from "./CropModal";

interface PhotoCakeCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    image: File | null;
    imageUrl?: string;
    message: string;
  }) => void;
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
  initialData,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(
    initialData?.image || null
  );
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.imageUrl || ""
  );
  const [croppedImage, setCroppedImage] = useState<string>(
    initialData?.imageUrl || ""
  );
  const [message, setMessage] = useState(initialData?.message || "");
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [errors, setErrors] = useState<{ image?: string; message?: string }>(
    {}
  );
  const [imageScale, setImageScale] = useState(0.9);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<"upload" | "message">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setSelectedImage(initialData.image || null);
      setImagePreview(initialData.imageUrl || "");
      setCroppedImage(initialData.imageUrl || "");
      setMessage(initialData.message || "");
      setActiveTab(initialData.imageUrl ? "message" : "upload");
    }
  }, [initialData]);

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return "Only png & jpg images.";
    }
    if (file.size > maxFileSize) {
      return "File size should be 100kb to 10mb.";
    }
    return null;
  };
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, image: error }));
      return;
    }
    setSelectedImage(file);
    setErrors((prev) => ({ ...prev, image: undefined }));
    setImageScale(0.9);
    setImagePosition({ x: 0, y: 0 });
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
    setImagePreview("");
    setCroppedImage("");
    setImageScale(0.9);
    setImagePosition({ x: 0, y: 0 });
    setShowCropModal(false);
    setActiveTab("upload");
  };
  const handleSave = async () => {
    setIsUploading(true);
    const newErrors: { image?: string; message?: string } = {};

    if (!selectedImage || !croppedImage) {
      newErrors.image = "Please upload and crop an image for your photo cake.";
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
      const croppedFile = new File([blob], selectedImage!.name, {
        type: selectedImage!.type,
      });

      onSave({
        image: croppedFile,
        imageUrl: croppedImage,
        message: message.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      setErrors({
        image:
          error instanceof Error
            ? error.message
            : "Failed to save customization",
      });
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
    "Dad",
  ]; // Crop Modal Component  // Crop Modal Component

  // Handle image dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!croppedImage) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !croppedImage) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

        .writing-mode-vertical {
          writing-mode: vertical-lr;
          text-orientation: upright;
        }
      `}</style>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full my-4 sm:my-0 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col overflow-hidden">
          {" "}
          {/* Header - Fixed */}
          <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Personalise your cake
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              disabled={isUploading}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {/* Content - Scrollable */}{" "}
          <div className="p-3 sm:p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scroll-smooth">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 min-h-0">
              {" "}
              {/* Left Column - Cake Preview with Photo Frame */}
              <div className="flex flex-col items-center justify-center min-h-[250px] sm:min-h-[320px]">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                  {/* Background Image Container */}
                  <div
                    ref={imageContainerRef}
                    className="absolute inset-0 rounded-lg overflow-hidden bg-gray-100 cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}>
                    {croppedImage ? (
                      <div
                        className="absolute inset-0"
                        style={{
                          transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                          transformOrigin: "center center",
                          transition: isDragging
                            ? "none"
                            : "transform 0.2s ease",
                        }}>
                        <Image
                          src={croppedImage}
                          alt="Uploaded photo"
                          fill
                          className="object-cover pointer-events-none"
                          style={{ userSelect: "none" }}
                        />
                      </div>
                    ) : selectedImage && imagePreview ? (
                      <div className="absolute inset-0 flex items-center justify-center text-blue-600 bg-blue-50">
                        <div className="text-center">
                          <Crop className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm font-medium">Crop your image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                        <div className="text-center">
                          <Upload className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm font-medium">
                            Upload your photo
                          </p>
                          <p className="text-xs">
                            It will appear behind the frame
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Frame Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <Image
                      src="/frame.png"
                      alt="Cake frame"
                      fill
                      className="object-contain z-10"
                      priority
                    />
                  </div>

                  {/* Dynamic Text Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                    {/* Happy Birthday Text - Top Right Vertical */}
                    <div className="absolute top-6 right-6 text-center">
                      <div className="text-black font-bold text-xs sm:text-sm tracking-wide drop-shadow-sm  transform rotate-0">
                        HAPPY
                      </div>
                      <div className="text-black font-bold text-xs sm:text-sm tracking-wide drop-shadow-sm transform rotate-0 ">
                        BIRTHDAY
                      </div>
                      {message && (
                        <div className="text-red-500 font-bold text-sm sm:text-base drop-shadow-sm transform rotate-0 ">
                          {message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>{" "}
                {/* Image controls */}
                {croppedImage && (
                  <div className="mt-3 w-full max-w-xs">
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      {/* Zoom Control */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Zoom</span>
                          <span className="text-xs text-gray-600 font-medium">
                            {Math.round(imageScale * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="300"
                          value={Math.round(imageScale * 100)}
                          onChange={(e) =>
                            setImageScale(Number(e.target.value) / 100)
                          }
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                          style={{
                            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
                              ((imageScale - 0.5) / 2.5) * 100
                            }%, #e5e7eb ${
                              ((imageScale - 0.5) / 2.5) * 100
                            }%, #e5e7eb 100%)`,
                          }}
                        />
                      </div>

                      {/* Position Info */}
                      <p className="text-xs text-gray-500 text-center">
                        Drag image to reposition
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setImagePosition({ x: 0, y: 0 })}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          Center
                        </button>
                        <button
                          onClick={() => setShowCropModal(true)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1">
                          <Crop className="w-3 h-3" />
                          Crop
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>{" "}
              {/* Right Column - Upload and Message */}
              <div className="space-y-3 sm:space-y-4">
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "upload"
                        ? "bg-white text-pink-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}>
                    Upload Image
                  </button>
                  <button
                    onClick={() => setActiveTab("message")}
                    className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "message"
                        ? "bg-white text-pink-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}>
                    Cake Message
                  </button>
                </div>{" "}
                {/* Upload Tab */}
                {activeTab === "upload" && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-pink-300 rounded-lg p-3 sm:p-4 text-center bg-pink-50">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                          <CloudUpload className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-medium text-gray-800 mb-1">
                            Upload Image
                          </p>
                          <p className="text-xs text-gray-600">
                            File size should be 100kb to 10mb. Only png & jpg
                            images.
                          </p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-4 py-1.5 bg-pink-500 text-white text-sm font-medium rounded-lg hover:bg-pink-600 transition-colors"
                          disabled={isUploading}>
                          Choose File
                        </button>
                      </div>
                    </div>
                    {errors.image && (
                      <p className="text-sm text-red-600">{errors.image}</p>
                    )}{" "}
                    {selectedImage && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-xs">✓</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-green-800">
                                Image uploaded successfully
                              </p>
                              <p className="text-xs text-green-600">
                                {selectedImage.name}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleReset}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500 hover:text-red-700"
                            title="Remove image">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}{" "}
                {/* Message Tab */}
                {activeTab === "message" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Name to Cake
                      </label>
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter name here..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg"
                        disabled={isUploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will appear as "Happy Birthday{" "}
                        {message || "YourName"}"
                      </p>
                    </div>

              

                    {/* Preview */}
                    {message && (
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Preview:
                        </p>
                        <div className="text-center">
                          <div className="text-black font-bold text-lg">
                            HAPPY BIRTHDAY
                          </div>
                          <div className="text-black font-bold text-xl">
                            {message}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>{" "}
          </div>{" "}
          {/* Footer - Fixed */}
          <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors order-2 sm:order-1 text-sm"
              disabled={isUploading}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!croppedImage || isUploading}
              className="px-6 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 order-1 sm:order-2 text-sm">
              {isUploading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save & Continue</span>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Crop Modal */}
        <CropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageSrc={imagePreview}
          onSave={(croppedImageUrl) => {
            setCroppedImage(croppedImageUrl);
            setActiveTab("message");
          }}
        />
      </div>
    </>
  );
};

export default PhotoCakeCustomization;
