'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, Calendar, LogOut, Package, Heart, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="font-poppins text-2xl font-bold text-orange-600">Bakingo</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.phoneNumber}</span>
              </div>              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-poppins text-3xl font-bold mb-2">Welcome back!</h2>
              <p className="text-orange-100 text-lg">
                Ready to order some delicious cakes?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Favorite Items</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">              <div>
                <p className="text-gray-600 text-sm font-medium">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/')}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <Package className="w-8 h-8 text-gray-600 group-hover:text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Browse Cakes</span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <Clock className="w-8 h-8 text-gray-600 group-hover:text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Order History</span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <Heart className="w-8 h-8 text-gray-600 group-hover:text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Favorites</span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <User className="w-8 h-8 text-gray-600 group-hover:text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Profile</span>
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Phone Number</span>
              </div>
              <span className="font-medium text-gray-900">{user?.phoneNumber}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Member Since</span>
              </div>              <span className="font-medium text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-700">Account Status</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
