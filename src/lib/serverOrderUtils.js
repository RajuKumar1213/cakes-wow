/**
 * Server-side order utility functions
 * These functions can only be used in API routes as they require database access
 */
import Order from '@/models/Order.models';

/**
 * Generate unique order ID
 * Format: CWO + YYYYMMDD + 3-digit sequence number
 * Example: CWO20250609001
 */
export async function generateOrderId() {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    // Get today's orders count to generate sequence number
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayOrdersCount = await Order.countDocuments({
      orderDate: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    // Generate sequence number (starting from 1)
    const sequenceNumber = String(todayOrdersCount + 1).padStart(3, '0');
    
    return `CWO${datePrefix}${sequenceNumber}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    // Fallback to timestamp-based ID
    return `CWO${Date.now()}`;
  }
}

/**
 * Calculate order statistics (server-side with database access)
 */
export function calculateOrderStats(orders) {
  const stats = {
    total: orders.length,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  };

  orders.forEach(order => {
    stats[order.status]++;
    if (order.status !== 'cancelled') {
      stats.totalRevenue += order.totalAmount;
    }
  });

  stats.averageOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

  return stats;
}
