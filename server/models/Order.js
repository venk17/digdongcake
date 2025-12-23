import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Create a new order
router.post('/orders', async (req, res) => {
  try {
    console.log('📥 Received order data:', JSON.stringify(req.body, null, 2));
    
    // Create order with the exact data from request
    const order = new Order(req.body);
    
    // Save order
    await order.save();
    
    console.log('✅ Order saved successfully:', order._id);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    res.status(400).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
});

export default router;