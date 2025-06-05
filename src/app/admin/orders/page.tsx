'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import AdminNavbar from '@/components/AdminNavbar';
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  weight: string;
  price: number;
  imageUrl: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' };
      case 'preparing':
        return { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Preparing' };
      case 'ready':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready' };
      case 'out_for_delivery':
        return { color: 'bg-orange-100 text-orange-800', icon: Truck, label: 'Out for Delivery' };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };
    }
  };

  const { color, icon: Icon, label } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: Order['paymentStatus'] }) => {
  const getPaymentConfig = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'paid':
        return { color: 'bg-green-100 text-green-800', label: 'Paid' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', label: 'Failed' };
      case 'refunded':
        return { color: 'bg-gray-100 text-gray-800', label: 'Refunded' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const { color, label } = getPaymentConfig(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const OrderCard = ({ order, onStatusChange, onViewDetails }: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
  onViewDetails: (order: Order) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Order #{order.id}</h3>
        <p className="text-sm text-gray-600">{order.customerName}</p>
      </div>
      <div className="text-right">
        <StatusBadge status={order.status} />
        <p className="text-sm text-gray-600 mt-1">
          {new Date(order.orderDate).toLocaleDateString()}
        </p>
      </div>
    </div>

    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Phone className="w-4 h-4" />
        {order.customerPhone}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span className="line-clamp-1">{order.deliveryAddress}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Package className="w-4 h-4" />
        {order.items.length} item{order.items.length > 1 ? 's' : ''}
      </div>
    </div>

    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
    </div>

    <div className="flex items-center gap-2">
      <select
        value={order.status}
        onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="preparing">Preparing</option>
        <option value="ready">Ready</option>
        <option value="out_for_delivery">Out for Delivery</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button
        onClick={() => onViewDetails(order)}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-1"
      >
        <Eye className="w-4 h-4" />
        View
      </button>
    </div>
  </div>
);

const OrderDetailsModal = ({ order, onClose }: {
  order: Order;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Order Info */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Order ID:</span> #{order.id}</p>
                <p><span className="text-gray-600">Date:</span> {new Date(order.orderDate).toLocaleString()}</p>
                <p><span className="text-gray-600">Status:</span> <StatusBadge status={order.status} /></p>
                <p><span className="text-gray-600">Payment:</span> <PaymentStatusBadge status={order.paymentStatus} /></p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Name:</span> {order.customerName}</p>
                <p><span className="text-gray-600">Phone:</span> {order.customerPhone}</p>
                <p><span className="text-gray-600">Email:</span> {order.customerEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <p className="text-sm text-gray-600">Weight: {item.weight}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{item.price * item.quantity}</p>
                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee:</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>Total:</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function AdminOrders() {
  const { showSuccess } = useToast();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  // PLACEHOLDER: Mock data - Real order management system to be implemented
  // This will be replaced with actual API calls to fetch orders from database
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: 'DEMO-1001',
        customerName: 'John Doe',
        customerPhone: '+91 9876543210',
        customerEmail: 'john@example.com',
        deliveryAddress: '123 Main Street, Mumbai, Maharashtra 400001',
        items: [
          {
            id: '1',
            productName: 'Chocolate Truffle Cake',
            quantity: 1,
            weight: '1kg',
            price: 1250,
            imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'
          }
        ],
        subtotal: 1250,
        deliveryFee: 50,
        total: 1300,
        status: 'confirmed',
        paymentStatus: 'paid',
        orderDate: '2024-01-20T10:30:00Z',
        notes: 'Please deliver before 6 PM'
      },
      {
        id: 'DEMO-1002',
        customerName: 'Jane Smith',
        customerPhone: '+91 9876543211',
        customerEmail: 'jane@example.com',
        deliveryAddress: '456 Oak Avenue, Delhi, Delhi 110001',
        items: [
          {
            id: '2',
            productName: 'Red Velvet Cake',
            quantity: 1,
            weight: '500g',
            price: 750,
            imageUrl: 'https://images.unsplash.com/photo-1586985289906-406988974504?w=200'
          },
          {
            id: '3',
            productName: 'Chocolate Chip Cookies',
            quantity: 2,
            weight: '250g',
            price: 250,
            imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200'
          }
        ],
        subtotal: 1250,
        deliveryFee: 50,
        total: 1300,
        status: 'preparing',
        paymentStatus: 'paid',
        orderDate: '2024-01-20T14:15:00Z'
      },
      {
        id: 'DEMO-1003',
        customerName: 'Mike Johnson',
        customerPhone: '+91 9876543212',
        customerEmail: 'mike@example.com',
        deliveryAddress: '789 Pine Road, Bangalore, Karnataka 560001',
        items: [
          {
            id: '1',
            productName: 'Chocolate Truffle Cake',
            quantity: 2,
            weight: '500g',
            price: 850,
            imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'
          }
        ],
        subtotal: 1700,
        deliveryFee: 50,
        total: 1750,
        status: 'pending',
        paymentStatus: 'pending',
        orderDate: '2024-01-20T16:45:00Z'
      }
    ];
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);



  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    showSuccess(`Order status updated to ${newStatus}`, 'Status has been updated successfully');
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  const statuses = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <AdminNavbar />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Placeholder Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Orders Management - Demo Mode</h3>
              <p className="text-sm text-blue-700">
                This page displays sample order data for demonstration purposes. 
                Real order management functionality will be implemented when the shopping cart and checkout system is ready.
              </p>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Orders will appear here when customers place them.'
              }
            </p>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
