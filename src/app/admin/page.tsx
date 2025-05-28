'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading, { Spinner, PageLoading } from '@/components/Loading';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, changeType }: {
  title: string;
  value: string;
  change: string;
  icon: any;
  changeType: 'positive' | 'negative' | 'neutral';
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className={`text-sm mt-2 flex items-center gap-1 ${
          changeType === 'positive' ? 'text-green-600' : 
          changeType === 'negative' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          <TrendingUp className="w-4 h-4" />
          {change}
        </p>
      </div>
      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-orange-600" />
      </div>
    </div>
  </div>
);

const QuickAction = ({ title, description, icon: Icon, onClick, color = "orange" }: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  color?: string;
}) => (
  <button
    onClick={onClick}
    className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-left group"
  >
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  </button>
);

export default function AdminDashboard() {
  const { user, loading } = useAuth();
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
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Note: In a real app, you'd check if user has admin role
  // For demo purposes, we'll show the admin panel to any authenticated user

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-orange-600">Bakingo</h1>
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user?.phoneNumber}</span>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                User Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage your bakery business with powerful admin tools</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value="₹1,24,500"
            change="+12.5% from last month"
            icon={DollarSign}
            changeType="positive"
          />
          <StatCard
            title="Orders Today"
            value="47"
            change="+8.2% from yesterday"
            icon={ShoppingCart}
            changeType="positive"
          />
          <StatCard
            title="Total Products"
            value="156"
            change="12 products added this week"
            icon={Package}
            changeType="neutral"
          />
          <StatCard
            title="Active Users"
            value="2,847"
            change="+5.4% from last week"
            icon={Users}
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              title="Manage Products"
              description="Add, edit, or remove products from your catalog"
              icon={Package}
              onClick={() => router.push('/admin/products')}
            />
            <QuickAction
              title="View Orders"
              description="Track and manage customer orders"
              icon={ShoppingCart}
              onClick={() => router.push('/admin/orders')}
            />
            <QuickAction
              title="User Management"
              description="Manage customer accounts and permissions"
              icon={Users}
              onClick={() => router.push('/admin/users')}
            />
            <QuickAction
              title="Analytics"
              description="View detailed business analytics and reports"
              icon={BarChart3}
              onClick={() => router.push('/admin/analytics')}
              color="blue"
            />
            <QuickAction
              title="Settings"
              description="Configure store settings and preferences"
              icon={AlertCircle}
              onClick={() => router.push('/admin/settings')}
              color="purple"
            />
            <QuickAction
              title="Reports"
              description="Generate and download business reports"
              icon={Calendar}
              onClick={() => router.push('/admin/reports')}
              color="green"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New order #1234 received</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              <span className="text-sm text-green-600 font-medium">₹1,250</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Product "Chocolate Truffle Cake" updated</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Order #1233 delivered successfully</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>          </div>
        </div>

        {/* Loading Components Demo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading Components Demo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Default (Small)</p>
              <Loading size="sm" text="Loading..." />
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Default (Medium)</p>
              <Loading size="md" text="Loading..." />
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Default (Large)</p>
              <Loading size="lg" text="Loading..." />
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Inline Spinner</p>
              <Spinner size="md" className="text-pink-600" />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Inline Variant</p>
              <Loading variant="inline" text="Processing..." />
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Cake Theme (XL)</p>
              <Loading size="xl" text="Baking your order..." />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Usage Examples:</strong>
            </p>
            <div className="text-xs font-mono bg-white p-2 rounded border">
              <div>&lt;Loading size="md" text="Loading..." /&gt;</div>
              <div>&lt;Loading variant="inline" text="Processing..." /&gt;</div>
              <div>&lt;Loading variant="overlay" text="Please wait..." /&gt;</div>
              <div>&lt;Spinner size="sm" className="text-pink-600" /&gt;</div>
              <div>&lt;PageLoading text="Loading page..." /&gt;</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
