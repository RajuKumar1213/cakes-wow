"use client";

import React, { useState } from 'react';
import { Header, Footer } from '@/components';
import PhotoCakeCustomization from '@/components/PhotoCakeCustomization';
import { Camera, Sparkles, Heart, Star } from 'lucide-react';

const PhotoCakeDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [uploadedData, setUploadedData] = useState<{ image: File | null; message: string } | null>(null);

  const handleSave = (data: { image: File | null; message: string }) => {
    setUploadedData(data);
    setShowModal(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-pink-600" />
              <span className="text-pink-800 font-semibold">New Feature Demo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Photo Cake Customization
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience our beautiful photo upload feature - designed to be better than Bakingo!
            </p>
          </div>

          {/* Demo Product Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src="/images/photo.webp"
                    alt="Demo Photo Cake"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Custom Photo Birthday Cake
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">4.9</span>
                    <span className="text-xs text-gray-500">(234 reviews)</span>
                  </div>
                  <p className="text-gray-600">
                    Make it special with your favorite photo! Our edible photo printing technology 
                    ensures your memories taste as good as they look.
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-pink-600">₹899</span>
                  <span className="text-lg text-gray-500 line-through">₹1199</span>
                  <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                    Save 25%
                  </span>
                </div>

                {/* Photo Cake Customization Section */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-900">Personalize Your Photo Cake</h3>
                  </div>
                  
                  {uploadedData?.image ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={URL.createObjectURL(uploadedData.image)}
                            alt="Selected photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Photo uploaded ✓</p>
                          <p className="text-xs text-gray-500">{uploadedData.image.name}</p>
                          {uploadedData.message && (
                            <p className="text-xs text-purple-600 mt-1">
                              Message: "{uploadedData.message}"
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setShowModal(true)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <Heart className="h-4 w-4 inline mr-2" />
                        Add to Cart - ₹899
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="mb-3">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Camera className="h-8 w-8 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-700 mb-1">Make it special with your photo!</p>
                        <p className="text-xs text-gray-500">Upload your favorite picture to create a personalized cake</p>
                      </div>
                      <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <Camera className="h-4 w-4 inline mr-2" />
                        Add Your Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">High Quality Upload</h3>
              <p className="text-sm text-gray-600">Support for JPG, PNG, WEBP up to 10MB with drag & drop functionality</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Messages</h3>
              <p className="text-sm text-gray-600">Add custom messages to make your cake extra special</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Beautiful Design</h3>
              <p className="text-sm text-gray-600">Modern, intuitive interface that's better than the competition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Cake Customization Modal */}
      <PhotoCakeCustomization
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        productName="Custom Photo Birthday Cake"
      />

      <Footer />
    </>
  );
};

export default PhotoCakeDemo;
