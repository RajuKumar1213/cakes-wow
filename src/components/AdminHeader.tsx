'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import axios from 'axios';

interface AdminHeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonUrl?: string;
}

const AdminHeader = ({
  title,
  showBackButton = false,
  backButtonText = "Back to Dashboard",
  backButtonUrl = "/admin"
}: AdminHeaderProps) => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [adminEmail, setAdminEmail] = useState<string>('');

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await axios.get('/api/auth/admin-info');
        if (response.data.email) {
          setAdminEmail(response.data.email);
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
        // If fetching admin info fails, redirect to login
        router.push('/admin-login');
      }
    };

    fetchAdminInfo();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/auth/admin-logout');

      if (response.status === 200) {
        showSuccess('Success', 'Logged out successfully');
        // Clear any client-side storage if needed
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');

        // Redirect to admin login
        router.push('/admin-login');
      } else {
        showError('Error', 'Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showError('Error', 'An error occurred during logout');

      // Force redirect even if API call fails
      localStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_token');
      router.push('/admin-login');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <>
                <button
                  onClick={() => router.push(backButtonUrl)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>{backButtonText}</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
              </>
            )}
            <h1 className="text-2xl font-bold text-orange-600">Cakes Wow</h1>
            <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
              Admin
            </span>
            {title && title !== "Admin Dashboard" && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              </>
            )}
          </div>          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm text-gray-500">Logged in as</span>
              <div className="text-gray-700 font-medium">{adminEmail || 'Admin'}</div>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              User Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
