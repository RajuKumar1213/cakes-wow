'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Settings,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import axios from 'axios';

interface AdminInfo {
  email: string;
  id: string;
}

const AdminNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { showSuccess, showError } = useToast();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      current: pathname.startsWith('/admin/products')
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      current: pathname.startsWith('/admin/orders')
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: pathname.startsWith('/admin/users')
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/admin/analytics')
    }
  ];

  // Fetch admin information
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await axios.get('/api/auth/admin-info');
        if (response.status === 200) {
          setAdminInfo(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
        // If token is invalid, redirect to login
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.push('/admin-login');
        }
      } finally {
        setLoading(false);
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

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-orange-600">Cakes Wow</h1>
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                Admin
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side - Admin Info and Actions */}
          <div className="flex items-center gap-4">
            {/* User Dashboard Link */}
            <button
              onClick={() => router.push("/dashboard")}
              className="hidden sm:block text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              User Dashboard
            </button>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {loading ? 'Loading...' : adminInfo?.email || 'Admin'}
                  </div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {adminInfo?.email || 'Admin'}
                    </div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      router.push("/dashboard");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    User Dashboard
                  </button>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      item.current
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                );
              })}
            </div>
            
            {/* Mobile User Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
              <button
                onClick={() => {
                  router.push("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
                User Dashboard
              </button>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default AdminNavbar;
