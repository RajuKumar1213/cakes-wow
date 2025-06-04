'use client';

import React from 'react';
import { Header, Footer, AddOns } from '@/components';

const AddOnsPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Make Your Order Extra Special
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our collection of premium add-ons to make your celebration unforgettable. 
              All selections are saved and will be included in your order.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <AddOns showTitle={false} layout="grid" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddOnsPage;
