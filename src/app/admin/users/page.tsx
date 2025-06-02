'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Phone,
  Calendar,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  status: 'active' | 'inactive' | 'banned';
  joinedDate: string;
  lastLogin: string;
  totalOrders: number;
  totalSpent: number;
  orderCount: number;
}

const UserCard = ({ user, onEdit, onBan, onActivate, onViewDetails }: {
  user: User;
  onEdit: (user: User) => void;
  onBan: (userId: string) => void;
  onActivate: (userId: string) => void;
  onViewDetails: (user: User) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {user.name || 'User'}
            </h3>
            <div className="flex items-center gap-1 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{user.phoneNumber}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                <button
                  onClick={() => {
                    onViewDetails(user);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(user);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </button>
                {user.status === 'active' ? (
                  <button
                    onClick={() => {
                      onBan(user.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Ban className="w-4 h-4" />
                    Ban User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onActivate(user.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate User
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Joined</p>
          <p className="font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(user.joinedDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Last Login</p>
          <p className="font-medium">{new Date(user.lastLogin).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Total Orders</p>
          <p className="font-medium flex items-center gap-1">
            <ShoppingBag className="w-4 h-4" />
            {user.totalOrders}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Total Spent</p>
          <p className="font-medium text-green-600">₹{user.totalSpent.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

const UserDetailsModal = ({ user, isOpen, onClose }: {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name || 'User'}</h3>
              <p className="text-gray-600">{user.phoneNumber}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' ? 'bg-green-100 text-green-800' :
                user.status === 'banned' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Phone:</span> {user.phoneNumber}</p>
                <p><span className="text-gray-500">Email:</span> {user.email || 'Not provided'}</p>
                <p><span className="text-gray-500">Joined:</span> {new Date(user.joinedDate).toLocaleDateString()}</p>
                <p><span className="text-gray-500">Last Login:</span> {new Date(user.lastLogin).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Order Statistics</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Total Orders:</span> {user.totalOrders}</p>
                <p><span className="text-gray-500">Total Spent:</span> ₹{user.totalSpent.toLocaleString()}</p>
                <p><span className="text-gray-500">Average Order:</span> ₹{user.totalOrders > 0 ? Math.round(user.totalSpent / user.totalOrders).toLocaleString() : '0'}</p>
                <p><span className="text-gray-500">Status:</span> {
                  user.totalSpent > 50000 ? 'VIP Customer' :
                  user.totalSpent > 20000 ? 'Premium Customer' :
                  user.totalSpent > 5000 ? 'Regular Customer' :
                  'New Customer'
                }</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  // PLACEHOLDER: Mock data - Real user management system to be implemented
  // This will be replaced with actual API calls to fetch users from database
  const mockUsers: User[] = [
    {
      id: 'DEMO-1',
      phoneNumber: '+91 98765 43210',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      status: 'active',
      joinedDate: '2024-01-15',
      lastLogin: '2024-12-10',
      totalOrders: 25,
      totalSpent: 45000,
      orderCount: 25
    },
    {
      id: 'DEMO-2',
      phoneNumber: '+91 87654 32109',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      status: 'active',
      joinedDate: '2024-02-20',
      lastLogin: '2024-12-09',
      totalOrders: 12,
      totalSpent: 18500,
      orderCount: 12
    },
    {
      id: 'DEMO-3',
      phoneNumber: '+91 76543 21098',
      name: 'Amit Patel',
      status: 'inactive',
      joinedDate: '2024-03-10',
      lastLogin: '2024-11-25',
      totalOrders: 8,
      totalSpent: 12000,
      orderCount: 8
    },
    {
      id: 'DEMO-4',
      phoneNumber: '+91 65432 10987',
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      status: 'banned',
      joinedDate: '2024-01-05',
      lastLogin: '2024-10-15',
      totalOrders: 3,
      totalSpent: 2500,
      orderCount: 3
    },
    {
      id: '5',
      phoneNumber: '+91 54321 09876',
      name: 'Vikram Singh',
      status: 'active',
      joinedDate: '2024-11-01',
      lastLogin: '2024-12-10',
      totalOrders: 35,
      totalSpent: 72000,
      orderCount: 35
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // Load users data
    setUsers(mockUsers);
  }, [user, loading, router]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phoneNumber.includes(searchTerm) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handleEditUser = (user: User) => {
    showSuccess(`Edit functionality for ${user.name} will be implemented`, 'Coming soon');
  };

  const handleBanUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'banned' as const } : user
    ));
    showSuccess('User has been banned', 'User status updated successfully');
  };

  const handleActivateUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'active' as const } : user
    ));
    showSuccess('User has been activated', 'User status updated successfully');
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user?.phoneNumber}</span>
            </div>
          </div>
        </div>
      </header>      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Placeholder Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">User Management - Demo Mode</h3>
              <p className="text-sm text-blue-700">
                This page displays sample user data for demonstration purposes. 
                Real user management functionality will be implemented with the authentication system integration.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onBan={handleBanUser}
              onActivate={handleActivateUser}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
