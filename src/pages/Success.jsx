import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  MessageCircle, 
  Home, 
  Clock, 
  Truck, 
  Phone, 
  Mail,
  Share2,
  Calendar,
  MapPin
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Success = () => {
  const { orderId } = useParams();
  const { theme } = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    fetchOrder();
    generateEstimatedDelivery();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`https://digdongcake.onrender.com/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEstimatedDelivery = () => {
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
    const options = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    setEstimatedDelivery(deliveryTime.toLocaleTimeString('en-IN', options));
  };

  const handleWhatsAppContact = () => {
    const message = `Hi Ding Dong Cake & Bake! I've placed order #${orderId}. Order details:\n\n${order?.items?.map(item => `• ${item.name} x${item.quantity}`).join('\n')}\n\nTotal: ₹${order?.total?.toFixed(2) || order?.totalAmount}\n\nPlease confirm my order and let me know the delivery time.`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareOrder = async () => {
    const orderDetails = `
Order Confirmed! 🎉

Order ID: ${orderId}
Total: ₹${order?.total?.toFixed(2) || order?.totalAmount}
Status: ${order?.status}

Items:
${order?.items?.map(item => `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}

Thank you for choosing Ding Dong Cake & Bake!
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Order Confirmation - Ding Dong Cake & Bake',
          text: orderDetails,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(orderDetails);
      alert('Order details copied to clipboard!');
    }
  };

  const downloadReceipt = () => {
    // Simple receipt generation
    const receipt = `
DING DONG CAKE & BAKE
----------------------------
Order ID: ${orderId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
----------------------------
${order?.items?.map(item => 
  `${item.name} x${item.quantity}
  ₹${(item.price * item.quantity).toFixed(2)}`
).join('\n')}
----------------------------
Subtotal: ₹${order?.subtotal?.toFixed(2) || order?.totalAmount}
Delivery: ${order?.deliveryFee === 0 ? 'FREE' : `₹${order?.deliveryFee}`}
Tax: ₹${order?.tax?.toFixed(2) || '0.00'}
Total: ₹${order?.total?.toFixed(2) || order?.totalAmount}
----------------------------
Payment: ${order?.paymentMethod === 'COD' ? 'Cash on Delivery' : order?.paymentMethod}
Status: ${order?.status}
Estimated Delivery: ${estimatedDelivery}
----------------------------
Thank you for your order!
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <LoadingSpinner text="Confirming your order..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Order Confirmed! 🎉
            </h1>
            
            <div className={`text-xl leading-relaxed max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
             <p className="mb-3">
  Thank you for choosing <span className="font-bold text-amber-600">DING DONG CAKE & BAKE</span>!
</p>

<p>Your delicious treats are being prepared with love! ❤️</p>

<p className="mt-2 font-medium text-amber-700">
  We have received your order — our team will call you within 10 minutes for confirmation. 📞
</p>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Timeline */}
              <div className={`p-6 rounded-xl shadow-sm border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span>Order Timeline</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Order Confirmed
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Preparing Your Order
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Our bakers are working on it
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Out for Delivery
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        Estimated by {estimatedDelivery}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {order && (
                <div className={`p-6 rounded-xl shadow-sm border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Order Summary
                  </h3>
                  
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <div className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </div>
                            <div className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Qty: {item.quantity} × ₹{item.price}
                            </div>
                          </div>
                        </div>
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                        }`}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Details Card */}
              <div className={`p-6 rounded-xl shadow-sm border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Order Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Order ID
                    </span>
                    <span className="font-mono text-sm">{orderId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Total Amount
                    </span>
                    <span className={`font-bold ${
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      ₹{order?.total?.toFixed(2) || order?.totalAmount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Payment Method
                    </span>
                    <span>Cash on Delivery</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Status
                    </span>
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {order?.status || 'Confirmed'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Estimated Delivery
                    </span>
                    <span className="text-sm">{estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`p-6 rounded-xl shadow-sm border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact on WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={downloadReceipt}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Receipt</span>
                  </button>
                  
                  <button
                    onClick={handleShareOrder}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share Order</span>
                  </button>
                  
                  <Link
                    to={`/order-details/${orderId}`}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>

              {/* Support Info */}
              <div className={`p-6 rounded-xl shadow-sm border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Need Help?
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-amber-600" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-amber-600" />
                    <span>WhatsApp Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-amber-600" />
                    <span>support@dingdong.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;