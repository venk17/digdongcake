import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  CheckCircle, 
  Truck, 
  Home,
  Receipt,
  User,
  Store
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";
import LoadingSpinner from "../components/LoadingSpinner";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://dingdong-0v1c.onrender.com/api/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-500';
      case 'ready':
        return 'text-green-600';
      case 'out for delivery':
        return 'text-blue-500';
      case 'preparing':
      case 'processing':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5" />;
      case 'out for delivery':
        return <Truck className="h-5 w-5" />;
      case 'preparing':
      case 'processing':
        return <Package className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryTypeText = (type) => {
    return type === 'self-pickup' ? 'Self Pickup' : 'Home Delivery';
  };

  const getDeliveryTypeIcon = (type) => {
    return type === 'self-pickup' ? <Store className="h-4 w-4" /> : <Truck className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <LoadingSpinner text="Loading order details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <div className={`text-6xl mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            ❌
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {error}
          </h2>
          <Link
            to="/"
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <div className={`text-6xl mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            📦
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Order Not Found
          </h2>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            The order you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const isSelfPickup = order.customerInfo?.deliveryType === 'self-pickup';

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Order Details
              </h1>
              <p className={`mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Order ID: {order._id}
              </p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full font-medium flex items-center space-x-2 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {getStatusIcon(order.status)}
            <span className={getStatusColor(order.status)}>
              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className={`p-6 rounded-xl shadow-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center space-x-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Package className="h-5 w-5 text-amber-600" />
                <span>Order Items ({order.items?.length || 0})</span>
              </h2>

              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Quantity: {item.quantity} • ₹{item.price} each
                      </p>
                      {item.weight && (
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {item.weight}
                        </p>
                      )}
                    </div>
                    <div className={`text-right ${
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      <div className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className={`p-6 rounded-xl shadow-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center space-x-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <MapPin className="h-5 w-5 text-amber-600" />
                <span>
                  {isSelfPickup ? 'Pickup Information' : 'Delivery Information'}
                </span>
              </h2>

              <div className="space-y-3">
                {/* Delivery Type */}
                <div className="flex items-center space-x-3">
                  {getDeliveryTypeIcon(order.customerInfo?.deliveryType)}
                  <div>
                    <div className="font-medium">Service Type</div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {getDeliveryTypeText(order.customerInfo?.deliveryType)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-amber-600" />
                  <div>
                    <div className="font-medium">{order.customerInfo?.name || order.customerName}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-amber-600" />
                  <div>{order.customerInfo?.mobile || order.phone}</div>
                </div>

                {order.customerInfo?.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-amber-600" />
                    <div>{order.customerInfo.email}</div>
                  </div>
                )}

                {/* Address Section - Only show for delivery */}
                {!isSelfPickup && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-amber-600 mt-1" />
                    <div>
                      <div className="font-medium">Delivery Address</div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {order.customerInfo?.address}
                      </p>
                      {order.customerInfo?.landmark && (
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <strong>Landmark:</strong> {order.customerInfo.landmark}
                        </p>
                      )}
                      {order.customerInfo?.deliveryInstructions && (
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <strong>Instructions:</strong> {order.customerInfo.deliveryInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Self Pickup Information */}
                {isSelfPickup && (
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <Store className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-amber-800 dark:text-amber-300">Self Pickup Instructions</div>
                        <p className={`text-sm mt-1 ${
                          theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                        }`}>
                          Please collect your order from our store. We'll contact you when it's ready for pickup.
                        </p>
                        <div className="mt-2">
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-amber-300' : 'text-amber-800'
                          }`}>
                            Store Address:
                          </p>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                          }`}>
                            123 Cake Street, Sweet City, SC 12345
                          </p>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                          }`}>
                            <strong>Store Hours:</strong> 9:00 AM - 9:00 PM (Daily)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className={`p-6 rounded-xl shadow-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center space-x-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Receipt className="h-5 w-5 text-amber-600" />
                <span>Order Summary</span>
              </h2>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <div>
                    <div className="font-medium">{formatDate(order.createdAt)}</div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatTime(order.createdAt)}
                    </div>
                  </div>
                </div>

                {order.estimatedDelivery && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="font-medium">
                        {isSelfPickup ? 'Estimated Ready Time' : 'Estimated Delivery'}
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {order.estimatedDelivery}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-gray-600">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Subtotal
                    </span>
                    <span>₹{order.subtotal?.toFixed(2) || order.totalAmount}</span>
                  </div>
                  
                  {order.deliveryFee !== undefined && order.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Delivery Fee
                      </span>
                      <span>₹{order.deliveryFee}</span>
                    </div>
                  )}

                  {order.deliveryFee === 0 && !isSelfPickup && (
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Delivery Fee
                      </span>
                      <span className="text-green-500">Free</span>
                    </div>
                  )}

                  {isSelfPickup && (
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Pickup
                      </span>
                      <span className="text-green-500">Free</span>
                    </div>
                  )}

                  {order.tax !== undefined && order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Tax
                      </span>
                      <span>₹{order.tax?.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      Total
                    </span>
                    <span className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}>
                      ₹{order.total?.toFixed(2) || order.totalAmount}
                    </span>
                  </div>
                </div>

                {order.paymentMethod && (
                  <div className={`p-3 rounded-lg mt-4 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="text-sm font-medium">Payment Method</div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Support */}
            <div className={`p-6 rounded-xl shadow-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Need Help?
              </h3>
              <p className={`text-sm mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                If you have any questions about your order, contact our support team.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-amber-600" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <span>support@dingdongcakes.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;