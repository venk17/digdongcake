import express from 'express';
import Order from '../models/Order.js';
import { sendOrderNotifications } from '../services/notifications.js';

const router = express.Router();

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
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    
    // Send conditional notifications based on customer contact info
    try {
      const notificationResults = await sendOrderNotifications(savedOrder);
      console.log('Notification results:', notificationResults);
      
      // Optional: Update order with notification status
      savedOrder.notifications = {
        whatsappSent: notificationResults.whatsappSent,
        emailSent: notificationResults.emailSent,
        businessWhatsappSent: notificationResults.businessWhatsappSent,
        businessEmailSent: notificationResults.businessEmailSent,
        sentAt: new Date()
      };
      await savedOrder.save();
      
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the order creation if notifications fail
    }
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;