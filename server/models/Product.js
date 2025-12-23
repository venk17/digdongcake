import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number
  },
  category: {
    type: String,
    required: true,
    enum: ['cakes', 'pizza', 'brownies', 'custom']
  },
  image: {
    type: String,
    required: true
  },
  ingredients: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);