'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  AlertTriangle
} from 'lucide-react';

const AnalyticsCard = ({ title, value, change, changeType, icon: Icon }: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className={`text-sm font-medium ${
        changeType === 'positive' ? 'text-green-600' : 
        changeType === 'negative' ? 'text-red-600' : 
        'text-gray-600'
      }`}>
        {changeType === 'positive' ? (
          <TrendingUp className="w-4 h-4 inline mr-1" />
        ) : changeType === 'negative' ? (
          <TrendingDown className="w-4 h-4 inline mr-1" />
        ) : null}
        {change}
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Analytics & Reports</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Placeholder Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900 mb-1">Analytics Dashboard - Coming Soon</h3>
              <p className="text-sm text-amber-700">
                Advanced analytics and reporting features are currently under development. 
                This will include sales trends, customer insights, product performance, and financial reports.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Revenue"
            value="₹0"
            change="Coming Soon"
            changeType="neutral"
            icon={DollarSign}
          />
          <AnalyticsCard
            title="Total Orders"
            value="0"
            change="Real-time tracking"
            changeType="neutral"
            icon={ShoppingCart}
          />
          <AnalyticsCard
            title="Customer Growth"
            value="0"
            change="User analytics"
            changeType="neutral"
            icon={Users}
          />
          <AnalyticsCard
            title="Product Performance"
            value="0"
            change="Inventory insights"
            changeType="neutral"
            icon={Package}
          />
        </div>

        {/* Planned Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Analytics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Sales Analytics
            </h3>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">Sales Trends & Insights</h4>
              <p className="text-sm text-gray-600 mb-4">
                Track daily, weekly, and monthly sales performance with interactive charts and graphs.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Revenue trends over time</p>
                <p>• Top-selling products</p>
                <p>• Peak sales hours/days</p>
                <p>• Category performance</p>
              </div>
            </div>
          </div>

          {/* Customer Analytics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Customer Analytics
            </h3>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">Customer Insights</h4>
              <p className="text-sm text-gray-600 mb-4">
                Understand customer behavior, preferences, and purchasing patterns.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Customer acquisition metrics</p>
                <p>• Repeat purchase rates</p>
                <p>• Order frequency analysis</p>
                <p>• Geographic distribution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Analytics Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Financial Reports</h4>
              <p className="text-sm text-gray-600">Monthly and quarterly financial summaries with profit/loss analysis.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Inventory Analytics</h4>
              <p className="text-sm text-gray-600">Stock levels, turnover rates, and inventory optimization insights.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Predictive Analytics</h4>
              <p className="text-sm text-gray-600">Demand forecasting and sales predictions using historical data.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
