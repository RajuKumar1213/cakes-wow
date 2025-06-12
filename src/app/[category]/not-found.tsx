import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.562M15 6.25a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Category Not Found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The category you're looking for doesn't exist or may have been moved.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold"
            >
              Go to Home
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                href="/birthday-cakes"
                className="px-4 py-2 text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
              >
                Birthday Cakes
              </Link>
              <Link
                href="/anniversary-cakes"
                className="px-4 py-2 text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
              >
                Anniversary Cakes
              </Link>
              <Link
                href="/gourmet-cakes"
                className="px-4 py-2 text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
              >
                Gourmet Cakes
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}