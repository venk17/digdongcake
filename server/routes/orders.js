import express from 'express';
import Order from '../models/Order.js';
import { sendOrderNotifications, testNotificationSystem } from '../services/notifications.js';

const router = express.Router();

// ============================================
// ORDER ROUTES
// ============================================

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// CREATE ORDER WITH NOTIFICATIONS
// ============================================

router.post('/', async (req, res) => {
  console.log('\n📦 INCOMING ORDER REQUEST:');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Normalize customer info structure
    const customerInfo = {
      name: req.body.name || req.body.customerName || req.body.customerInfo?.name || 'Customer',
      mobile: req.body.mobile || req.body.phone || req.body.customerInfo?.mobile || req.body.customerInfo?.phone || '',
      email: req.body.email || req.body.customerInfo?.email || '',
      address: req.body.address || req.body.deliveryAddress || req.body.customerInfo?.address || '',
      landmark: req.body.landmark || req.body.customerInfo?.landmark || '',
      deliveryInstructions: req.body.instructions || req.body.deliveryInstructions || req.body.customerInfo?.deliveryInstructions || '',
      deliveryType: req.body.deliveryType || req.body.customerInfo?.deliveryType || 'delivery'
    };
    
    // Prepare order data
    const orderData = {
      customerInfo: customerInfo,
      items: req.body.items || req.body.cartItems || [],
      totalAmount: req.body.totalAmount || req.body.total || req.body.grandTotal || 0,
      paymentMethod: req.body.paymentMethod || req.body.paymentType || 'COD',
      status: 'pending',
      notificationStatus: {
        attempted: false,
        whatsapp: 'pending',
        email: 'pending',
        businessWhatsapp: 'pending',
        businessEmail: 'pending',
        lastAttempt: null,
        error: null
      }
    };
    
    console.log('📝 Processed Order Data:', orderData);
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log('✅ Order saved to database:', savedOrder._id);
    
    // Update notification status to processing
    await Order.findByIdAndUpdate(savedOrder._id, {
      'notificationStatus.attempted': true,
      'notificationStatus.lastAttempt': new Date()
    });
    
    // Send notifications in background
    setTimeout(async () => {
      try {
        console.log('\n🚀 Starting background notifications for order:', savedOrder._id);
        const notificationResults = await sendOrderNotifications(savedOrder);
        
        // Update order with notification results
        await Order.findByIdAndUpdate(savedOrder._id, {
          'notificationStatus.whatsapp': notificationResults.whatsappSent ? 'sent' : 'failed',
          'notificationStatus.email': notificationResults.emailSent ? 'sent' : 'failed',
          'notificationStatus.businessWhatsapp': notificationResults.businessWhatsappSent ? 'sent' : 'failed',
          'notificationStatus.businessEmail': notificationResults.businessEmailSent ? 'sent' : 'failed',
          'notificationStatus.completedAt': new Date(),
          'notificationResults': notificationResults
        });
        
        console.log('✅ Notification results saved to database');
        
        // Log summary
        console.log('\n📊 FINAL NOTIFICATION SUMMARY:');
        console.log('Customer WhatsApp:', notificationResults.whatsappSent ? '✅ Sent' : '❌ Failed');
        console.log('Customer Email:', notificationResults.emailSent ? '✅ Sent' : '❌ Failed');
        console.log('Business WhatsApp:', notificationResults.businessWhatsappSent ? '✅ Sent' : '❌ Failed');
        console.log('Business Email:', notificationResults.businessEmailSent ? '✅ Sent' : '❌ Failed');
        
      } catch (notificationError) {
        console.error('💥 Background notification error:', notificationError);
        await Order.findByIdAndUpdate(savedOrder._id, {
          'notificationStatus.error': notificationError.message
        });
      }
    }, 1000); // 1 second delay
    
    // Immediate response to client
    res.status(201).json({
      success: true,
      message: 'Order created successfully! We will contact you within 10 minutes.',
      orderId: savedOrder._id,
      orderNumber: `DD${savedOrder._id.toString().slice(-6).toUpperCase()}`,
      notificationStatus: 'Processing...',
      customerInfo: {
        name: customerInfo.name,
        mobile: customerInfo.mobile,
        deliveryType: customerInfo.deliveryType
      },
      amount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod
    });
    
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(e => e.message) : []
    });
  }
});

// ============================================
// NOTIFICATION TESTING ROUTES
// ============================================

// Test notification system
router.get('/test/notifications', async (req, res) => {
  try {
    const testResults = await testNotificationSystem();
    res.json({
      success: true,
      message: 'Notification test completed',
      results: testResults
    });
  } catch (error) {
    console.error('❌ Notification test error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Check notification status
router.get('/:id/notifications/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      success: true,
      orderId: order._id,
      notificationStatus: order.notificationStatus || 'No status',
      notificationResults: order.notificationResults || {},
      customerContact: {
        name: order.customerInfo?.name,
        mobile: order.customerInfo?.mobile,
        email: order.customerInfo?.email
      },
      lastUpdated: order.updatedAt,
      orderStatus: order.status
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Resend notifications for an order
router.post('/:id/notifications/resend', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    console.log('🔄 Resending notifications for order:', order._id);
    console.log('Customer Info:', order.customerInfo);
    
    const results = await sendOrderNotifications(order);
    
    // Update order with new results
    await Order.findByIdAndUpdate(order._id, {
      'notificationStatus.whatsapp': results.whatsappSent ? 'resent' : 'failed',
      'notificationStatus.email': results.emailSent ? 'resent' : 'failed',
      'notificationStatus.businessWhatsapp': results.businessWhatsappSent ? 'resent' : 'failed',
      'notificationStatus.businessEmail': results.businessEmailSent ? 'resent' : 'failed',
      'notificationStatus.lastResend': new Date(),
      'notificationResults': results
    });
    
    console.log('✅ Notifications resent. Results:', results);
    
    res.json({
      success: true,
      message: 'Notifications resent successfully',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Resend notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend notifications',
      error: error.message
    });
  }
});

// ============================================
// ORDER MANAGEMENT
// ============================================

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        customerName: order.customerInfo?.name,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Order updated successfully',
      order: order
    });
  } catch (error) {
    console.error('❌ Update order error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Order deleted successfully',
      deletedOrderId: order._id
    });
  } catch (error) {
    console.error('❌ Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
});

// ============================================
// DIAGNOSTIC ENDPOINTS
// ============================================

// Check service status
router.get('/services/status', async (req, res) => {
  const emailPass = process.env.EMAIL_PASS || '';
  const emailPassWithoutSpaces = emailPass.replace(/\s+/g, '');
  
  const status = {
    server: {
      port: process.env.PORT || 5000,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    },
    database: {
      configured: !!(process.env.MONGODB_URI),
      connected: 'unknown' // We'll check this separately
    },
    twilio: {
      configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      accountSid: process.env.TWILIO_ACCOUNT_SID ? '✓ Present' : '✗ Missing',
      authToken: process.env.TWILIO_AUTH_TOKEN ? '✓ Present' : '✗ Missing',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '✗ Missing',
      businessNumber: process.env.BUSINESS_PHONE_NUMBER || '✗ Missing'
    },
    email: {
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      user: process.env.EMAIL_USER || '✗ Missing',
      passwordLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
      passwordWithoutSpacesLength: emailPassWithoutSpaces.length,
      hasSpaces: emailPass.includes(' ')
    },
    business: {
      name: process.env.BUSINESS_NAME || '✗ Missing - Add BUSINESS_NAME to .env',
      email: process.env.BUSINESS_EMAIL || '✗ Missing',
      upiId: process.env.UPI_ID || '✗ Missing',
      adminUrl: process.env.ADMIN_DASHBOARD_URL || '✗ Missing',
      contactTime: process.env.CONTACT_TIME || '10 minutes'
    }
  };
  
  // Try to check database connection
  try {
    const dbState = Order.db.readyState;
    status.database.connected = dbState === 1 ? '✅ Connected' : '❌ Disconnected';
    status.database.readyState = dbState;
  } catch (error) {
    status.database.connected = '❌ Error checking connection';
  }
  
  res.json(status);
});

// Get recent orders with notification status
router.get('/recent/with-notifications', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('_id customerInfo.name customerInfo.mobile customerInfo.email totalAmount paymentMethod status notificationStatus createdAt');
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        _id: order._id,
        customerName: order.customerInfo?.name,
        customerMobile: order.customerInfo?.mobile,
        customerEmail: order.customerInfo?.email,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        notificationStatus: order.notificationStatus,
        createdAt: order.createdAt,
        orderNumber: `DD${order._id.toString().slice(-6).toUpperCase()}`
      }))
    });
  } catch (error) {
    console.error('❌ Get recent orders error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get order statistics
router.get('/statistics/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Total orders count
    const totalOrders = await Order.countDocuments();
    
    // Today's orders
    const todaysOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    res.json({
      success: true,
      statistics: {
        totalOrders,
        todaysOrders,
        totalRevenue,
        ordersByStatus: ordersByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        notificationStats: {
          whatsappSent: await Order.countDocuments({ 'notificationStatus.whatsapp': 'sent' }),
          emailSent: await Order.countDocuments({ 'notificationStatus.email': 'sent' })
        }
      }
    });
  } catch (error) {
    console.error('❌ Get statistics error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ============================================
// TEST ORDER CREATION ENDPOINT
// ============================================

// Create test order (for development)
router.post('/test/create', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Test endpoint not available in production'
    });
  }
  
  try {
    const testOrderData = {
      customerInfo: {
        name: 'Test Customer',
        mobile: '9876543210',
        email: 'testcustomer@example.com',
        address: '123 Test Street, Test City',
        landmark: 'Near Test Park',
        deliveryInstructions: 'Please call before delivery',
        deliveryType: 'delivery'
      },
      items: [
        {
          name: 'Chocolate Truffle Cake',
          quantity: 1,
          price: 650
        },
        {
          name: 'Red Velvet Cupcakes (6 pcs)',
          quantity: 1,
          price: 350
        }
      ],
      totalAmount: 1000,
      paymentMethod: 'COD',
      status: 'pending'
    };
    
    console.log('🧪 Creating test order...');
    
    const order = new Order({
      ...testOrderData,
      notificationStatus: {
        attempted: false,
        whatsapp: 'pending',
        email: 'pending',
        businessWhatsapp: 'pending',
        businessEmail: 'pending',
        lastAttempt: null,
        error: null
      }
    });
    
    const savedOrder = await order.save();
    
    // Send notifications
    const notificationResults = await sendOrderNotifications(savedOrder);
    
    // Update with results
    await Order.findByIdAndUpdate(savedOrder._id, {
      'notificationStatus.whatsapp': notificationResults.whatsappSent ? 'sent' : 'failed',
      'notificationStatus.email': notificationResults.emailSent ? 'sent' : 'failed',
      'notificationStatus.businessWhatsapp': notificationResults.businessWhatsappSent ? 'sent' : 'failed',
      'notificationStatus.businessEmail': notificationResults.businessEmailSent ? 'sent' : 'failed',
      'notificationStatus.completedAt': new Date(),
      'notificationResults': notificationResults
    });
    
    res.json({
      success: true,
      message: 'Test order created and notifications sent',
      orderId: savedOrder._id,
      orderNumber: `DD${savedOrder._id.toString().slice(-6).toUpperCase()}`,
      notificationResults: notificationResults,
      testData: testOrderData
    });
    
  } catch (error) {
    console.error('❌ Test order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test order',
      error: error.message
    });
  }
});

export default router;