'use client';

import { useState } from 'react';
import Loading, { Spinner, PageLoading } from '@/components/Loading';

export default function LoadingDemo() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showPageLoading, setShowPageLoading] = useState(false);

  if (showPageLoading) {
    return <PageLoading text="Demo page loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {showOverlay && (
        <Loading 
          variant="overlay" 
          text="Processing your request..." 
          size="lg"
        />
      )}
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Beautiful Loading Components Demo
          </h1>
          <p className="text-gray-600">
            Showcase of dark-themed SVG loading animations for Bakingo
          </p>
        </div>

        {/* Size Variants */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Size Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-4">Small</p>
              <Loading size="sm" text="Loading..." />
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-4">Medium</p>
              <Loading size="md" text="Loading..." />
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-4">Large</p>
              <Loading size="lg" text="Loading..." />
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-4">Extra Large</p>
              <Loading size="xl" text="Loading..." />
            </div>
          </div>
        </div>

        {/* Variant Types */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Variant Types</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Default Variant</h3>
              <div className="text-center p-8 border border-gray-200 rounded-lg">
                <Loading size="lg" text="Preparing your delicious cake..." />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Inline Variant</h3>
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-center">
                  <Loading variant="inline" size="md" text="Processing order..." />
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <Loading variant="inline" size="sm" text="Uploading image..." />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Simple Spinners</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Small Spinner</p>
                  <div className="flex justify-center">
                    <Spinner size="sm" className="text-pink-600" />
                  </div>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Medium Spinner</p>
                  <div className="flex justify-center">
                    <Spinner size="md" className="text-blue-600" />
                  </div>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Large Spinner</p>
                  <div className="flex justify-center">
                    <Spinner size="lg" className="text-green-600" />
                  </div>
                </div>
                
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">XL Spinner</p>
                  <div className="flex justify-center">
                    <Spinner size="xl" className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Interactive Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <button
                onClick={() => setShowOverlay(true)}
                className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors mb-4"
              >
                Show Overlay Loading
              </button>
              <p className="text-sm text-gray-600">
                Displays a full-screen overlay with loading animation
              </p>
              
              {showOverlay && (
                <button
                  onClick={() => setShowOverlay(false)}
                  className="mt-4 bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Hide Overlay
                </button>
              )}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setShowPageLoading(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4"
              >
                Show Page Loading
              </button>
              <p className="text-sm text-gray-600">
                Displays a full-page loading state
              </p>
            </div>
          </div>
        </div>

        {/* Dark Theme Example */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Dark Theme</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-300 mb-4">Cake Loading</p>
              <Loading size="lg" text="Baking..." className="text-pink-400" />
            </div>
            
            <div className="text-center p-6 border border-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-300 mb-4">Inline Loading</p>
              <Loading variant="inline" text="Processing..." className="text-blue-400" />
            </div>
            
            <div className="text-center p-6 border border-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-300 mb-4">Simple Spinner</p>
              <div className="flex justify-center">
                <Spinner size="lg" className="text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Examples</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Basic Loading</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<Loading size="md" text="Loading..." />`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Inline Loading</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<Loading variant="inline" text="Processing..." />`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Overlay Loading</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<Loading variant="overlay" text="Please wait..." />`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Simple Spinner</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<Spinner size="md" className="text-pink-600" />`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Page Loading</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<PageLoading text="Loading page..." />`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
