'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutProvider, useCheckout } from '@/contexts/CheckoutContext';

function DebugCheckoutContent() {
  const { user, loading } = useAuth();
  const { state } = useCheckout();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout Form Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth State */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Auth State</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">User:</span> {user ? 'Logged In' : 'Not Logged In'}</p>
            {user && (
              <>
                <p><span className="font-medium">Name:</span> {user.name || 'Not Set'}</p>
                <p><span className="font-medium">Email:</span> {user.email || 'Not Set'}</p>
                <p><span className="font-medium">Phone:</span> {user.phoneNumber || 'Not Set'}</p>
                <p><span className="font-medium">Addresses:</span> {user.address?.length || 0}</p>
                {user.address && user.address.length > 0 && (
                  <div className="ml-4">
                    <p><span className="font-medium">First Address:</span></p>
                    <p className="text-sm">Full: {user.address[0].fullAddress}</p>
                    <p className="text-sm">City: {user.address[0].city}</p>
                    <p className="text-sm">Pin: {user.address[0].pinCode}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Form State */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-green-600">Form State</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Full Name:</span> "{state.orderForm.fullName}"</p>
            <p><span className="font-medium">Mobile:</span> "{state.orderForm.mobileNumber}"</p>
            <p><span className="font-medium">Email:</span> "{state.orderForm.email}"</p>
            <p><span className="font-medium">Address:</span> "{state.orderForm.fullAddress}"</p>
            <p><span className="font-medium">Area:</span> "{state.orderForm.area}"</p>
            <p><span className="font-medium">Pin Code:</span> "{state.orderForm.pinCode}"</p>
          </div>
        </div>

        {/* Raw JSON */}
        <div className="bg-gray-50 p-4 rounded-lg shadow md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Raw Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">User Object:</h3>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-48">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Order Form:</h3>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-48">
                {JSON.stringify(state.orderForm, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>Open browser console (F12) to see CheckoutContext logs</li>
          <li>Look for prefilling messages starting with 🔄, 📱, 👤, 📧, 🏠</li>
          <li>Check if user data is loaded but form is still empty</li>
          <li>Refresh the page and see if behavior changes</li>
        </ol>
      </div>
    </div>
  );
}

export default function DebugCheckoutPage() {
  return (
    <CheckoutProvider>
      <DebugCheckoutContent />
    </CheckoutProvider>
  );
}
