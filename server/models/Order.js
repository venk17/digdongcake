import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String,
    weight: String
  }],
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      required: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      required: function() {
        return this.deliveryType === 'delivery';
      }
    },
    landmark: String,
    deliveryInstructions: String,
    deliveryType: {
      type: String,
      enum: ['delivery', 'self-pickup'],
      default: 'delivery'
    }
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    default: 'COD'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out for delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDelivery: String,
  orderDate: {
    type: Date,
    default: Date.now
  },
  notifications: {
    whatsappSent: Boolean,
    emailSent: Boolean,
    businessWhatsappSent: Boolean,
    businessEmailSent: Boolean,
    sentAt: Date
  }
}, {
  timestamps: true
});

// Add index for better query performance
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customerInfo.mobile': 1 });
orderSchema.index({ status: 1 });

export default mongoose.model('Order', orderSchema);