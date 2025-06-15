const mongoose = require('mongoose');

// Connect to MongoDB (using the same connection string as your app)
mongoose.connect('mongodb://localhost:27017/cakes-wow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the order schema to match your model
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  selectedWeight: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
});

const orderAddOnSchema = new mongoose.Schema({
  addOnId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  items: [orderItemSchema],
  addons: [orderAddOnSchema],
  customerInfo: { type: Object, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "pending" },
  paymentStatus: { type: String, default: "pending" },
  orderDate: { type: Date, default: Date.now },
  estimatedDeliveryDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

async function checkOrders() {
  try {
    console.log('🔍 Checking existing orders...');
    
    const orders = await Order.find({}).limit(5);
    console.log(`📦 Found ${orders.length} orders`);
    
    orders.forEach((order, index) => {
      console.log(`\n--- Order ${index + 1} ---`);
      console.log(`Order ID: ${order.orderId}`);
      console.log(`Items count: ${order.items.length}`);
      console.log(`Has addons field: ${order.addons !== undefined}`);
      console.log(`Addons count: ${order.addons ? order.addons.length : 'N/A'}`);
      if (order.addons && order.addons.length > 0) {
        console.log('Addons:', JSON.stringify(order.addons, null, 2));
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkOrders();
