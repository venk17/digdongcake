import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { MapPin, Clock, Shield, CreditCard, Wallet, Truck, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart, getCartItemsCount } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    landmark: '',
    deliveryInstructions: '',
    paymentMethod: 'COD',
    deliveryType: 'delivery'
  });
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState('30-45 min');

  // Calculate fees and totals
  const subtotal = getCartTotal();
  const tax = subtotal * 0.05;
  const total = formData.deliveryType === 'delivery' ? subtotal + deliveryFee + tax : subtotal + tax;

  useEffect(() => {
    setDeliveryFee(subtotal > 500 ? 0 : 49);
    
    const itemCount = getCartItemsCount();
    if (itemCount > 5) {
      setDeliveryTime('45-60 min');
    } else if (itemCount > 10) {
      setDeliveryTime('60-75 min');
    } else {
      setDeliveryTime('30-45 min');
    }
  }, [subtotal, getCartItemsCount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (formData.deliveryType === 'delivery' && !formData.address.trim()) {
      toast.error('Please enter your delivery address');
      return false;
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Prepare items array
      const items = cartItems.map(item => ({
        _id: item._id || '000000000000000000000001',
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        ...(item.image && { image: item.image }),
        ...(item.weight && { weight: item.weight })
      }));

      // Calculate total FRESH to avoid any state issues
      const calculatedSubtotal = getCartTotal();
      const calculatedTax = calculatedSubtotal * 0.05;
      const calculatedTotal = formData.deliveryType === 'delivery' 
        ? calculatedSubtotal + deliveryFee + calculatedTax 
        : calculatedSubtotal + calculatedTax;

      // Build order data EXACTLY matching schema
      const orderData = {
        items: items,
        customerInfo: {
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim().toLowerCase() || '',
          address: formData.deliveryType === 'delivery' ? formData.address.trim() : 'Store Pickup',
          landmark: formData.landmark.trim() || '',
          deliveryInstructions: formData.deliveryInstructions.trim() || '',
          deliveryType: formData.deliveryType
        },
        subtotal: Number(calculatedSubtotal.toFixed(2)),
        deliveryFee: formData.deliveryType === 'delivery' ? Number(deliveryFee) : 0,
        tax: Number(calculatedTax.toFixed(2)),
        total: Number(calculatedTotal.toFixed(2)),
        paymentMethod: formData.paymentMethod,
        status: 'pending',
        estimatedDelivery: formData.deliveryType === 'delivery' ? deliveryTime : 'Ready for pickup'
      };

      // Clean up empty optional fields
      if (!orderData.customerInfo.email) delete orderData.customerInfo.email;
      if (!orderData.customerInfo.landmark) delete orderData.customerInfo.landmark;
      if (!orderData.customerInfo.deliveryInstructions) delete orderData.customerInfo.deliveryInstructions;

      console.log('📦 FINAL Order Data:', JSON.stringify(orderData, null, 2));

      const response = await axios.post(
        'https://digdongcake.onrender.com/api/orders', 
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000
        }
      );
      
      console.log('✅ Order placed successfully:', response.data);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/success/${response.data._id}`);
      
    } catch (error) {
      console.error('❌ Order error:', error);
      
      if (error.response) {
        console.error('📡 Response:', error.response.data);
        
        // The backend is still rejecting - this means the backend route has an issue
        if (error.response.data.error?.includes('total')) {
          console.log(`
🚨 CRITICAL ISSUE DETECTED:
The frontend is sending correct data, but the backend route handler has a problem.
          
Check your backend route at: routes/orderRoutes.js
          
Run this test to confirm:
curl -X POST https://digdongcake.onrender.com/api/orders \\
  -H "Content-Type: application/json" \\
  -d '{
    "items": [{
      "_id": "000000000000000000000001",
      "name": "Test Cake",
      "price": 100,
      "quantity": 1
    }],
    "customerInfo": {
      "name": "Test User",
      "mobile": "9876543210",
      "deliveryType": "delivery",
      "address": "Test Address"
    },
    "total": 100,
    "paymentMethod": "COD",
    "status": "pending"
  }'
          `);
        }
        
        toast.error('Order failed. Please check backend logs.');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const paymentMethods = [
    {
      id: 'COD',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: Wallet
    },
    {
      id: 'Online',
      name: 'Online Payment',
      description: 'Pay securely with UPI/Card',
      icon: CreditCard
    }
  ];

  const deliveryOptions = [
    {
      id: 'delivery',
      name: 'Home Delivery',
      description: 'Get your order delivered to your doorstep',
      icon: Truck,
      time: deliveryTime,
      fee: deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`
    },
    {
      id: 'self-pickup',
      name: 'Self Pickup',
      description: 'Pick up your order from our store',
      icon: Store,
      time: '15-20 min',
      fee: 'Free'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Checkout
          </h1>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {getCartItemsCount()} items • ₹{subtotal.toFixed(2)}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Delivery Option */}
              <div className={`p-6 rounded-xl shadow-sm border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Truck className="h-5 w-5 text-amber-600" />
                  <span>Delivery Option</span>
                </h2>

                <div className="space-y-4">
                  {deliveryOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.deliveryType === option.id
                          ? theme === 'dark'
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-amber-500 bg-amber-50'
                          : theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value={option.id}
                        checked={formData.deliveryType === option.id}
                        onChange={handleInputChange}
                        className="mt-1 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <option.icon className="h-5 w-5 text-amber-600" />
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {option.name}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {option.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              {option.time}
                            </span>
                          </div>
                          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            • {option.fee}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Store Address for Pickup */}
                {formData.deliveryType === 'self-pickup' && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <Store className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Pickup Address
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          123 Baker Street, Food District, Mumbai, Maharashtra 400001
                        </div>
                        <div className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Mon-Sat: 8AM-10PM • Sun: 10AM-8PM
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Information - Only show for delivery option */}
              {formData.deliveryType === 'delivery' && (
                <div className={`p-6 rounded-xl shadow-sm border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <h2 className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <MapPin className="h-5 w-5 text-amber-600" />
                    <span>Delivery Information</span>
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          required
                          pattern="[0-9]{10}"
                          maxLength="10"
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="your@email.com (optional)"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Delivery Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Enter your complete delivery address with house number, street, area..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Landmark
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="Nearby landmark (optional)"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Delivery Time
                        </label>
                        <div className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className={`text-sm font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {deliveryTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Delivery Instructions
                      </label>
                      <textarea
                        name="deliveryInstructions"
                        value={formData.deliveryInstructions}
                        onChange={handleInputChange}
                        rows={2}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Any special instructions for delivery (optional)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information for Pickup */}
              {formData.deliveryType === 'self-pickup' && (
                <div className={`p-6 rounded-xl shadow-sm border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <h2 className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <MapPin className="h-5 w-5 text-amber-600" />
                    <span>Contact Information</span>
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          required
                          pattern="[0-9]{10}"
                          maxLength="10"
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="your@email.com (optional)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className={`p-6 rounded-xl shadow-sm border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <CreditCard className="h-5 w-5 text-amber-600" />
                  <span>Payment Method</span>
                </h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.paymentMethod === method.id
                          ? theme === 'dark'
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-amber-500 bg-amber-50'
                          : theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                        className="mt-1 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <method.icon className="h-4 w-4 text-amber-600" />
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {method.name}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className={`p-6 rounded-xl shadow-sm border sticky top-8 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id || item.id} className="flex justify-between items-start space-x-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium truncate ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.name}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Qty: {item.quantity} • ₹{item.price} each
                          </p>
                          {item.weight && (
                            <p className={`text-xs ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {item.weight}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`font-medium whitespace-nowrap ${
                        theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                      }`}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className={`flex justify-between ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span>Subtotal ({getCartItemsCount()} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {formData.deliveryType === 'delivery' && (
                    <div className={`flex justify-between ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span>Delivery Fee</span>
                      <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                    </div>
                  )}

                  <div className={`flex justify-between ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span>Tax (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>

                  {formData.deliveryType === 'delivery' && subtotal < 500 && (
                    <div className={`text-sm p-2 rounded text-center ${
                      theme === 'dark' ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700'
                    }`}>
                      Add ₹{(500 - subtotal).toFixed(2)} more for free delivery!
                    </div>
                  )}

                  <hr className={`my-2 ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`} />

                  <div className={`flex justify-between text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <span>Total Amount</span>
                    <span className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}>
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Trust Section */}
                <div className={`mt-6 p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center space-x-4 mb-3">
                    <div className={`flex items-center space-x-1 text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Shield className="h-3 w-3" />
                      <span>Secure Payment</span>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Clock className="h-3 w-3" />
                      <span>{formData.deliveryType === 'delivery' ? 'Fast Delivery' : 'Quick Pickup'}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
                      loading
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-lg'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Placing Order...</span>
                      </div>
                    ) : (
                      `Place Order • ₹${total.toFixed(2)}`
                    )}
                  </button>

                  <p className={`text-xs text-center mt-3 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    By placing your order, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;