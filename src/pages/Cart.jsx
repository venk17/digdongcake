import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Truck, Shield, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, getCartItemsCount } = useCart();
  const { theme } = useTheme();
  const [isRemoving, setIsRemoving] = useState(null);

  // Calculate delivery estimate
  const deliveryEstimate = "30-45 min";
  
  // Calculate subtotal and potential savings
  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + tax;
  const potentialSavings = cartItems.reduce((savings, item) => {
    if (item.originalPrice) {
      return savings + (item.originalPrice - item.price) * item.quantity;
    }
    return savings;
  }, 0);

  const handleRemoveItem = async (productId) => {
    setIsRemoving(productId);
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    removeFromCart(productId);
    setIsRemoving(null);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <div className={`text-8xl mb-6 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            🛒
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Your Cart is Empty
          </h2>
          <p className={`text-lg mb-8 max-w-md mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Looks like you haven't added anything to your cart yet. Start exploring our delicious menu!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center space-x-2 transition-all duration-200 hover:shadow-lg"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Browse Menu</span>
            </Link>
            <Link
              to="/"
              className={`border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center space-x-2 transition-all duration-200 ${
                theme === 'dark' ? 'hover:text-white' : ''
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Shopping Cart
            </h1>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {getCartItemsCount()} items in your cart
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark'
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                : 'text-red-500 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className={`p-6 rounded-xl shadow-sm border transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } ${isRemoving === item._id ? 'opacity-50 scale-95' : ''}`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Image */}
                  <Link 
                    to={`/product/${item._id}`}
                    className="flex-shrink-0 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                      <div className="flex-grow">
                        <Link 
                          to={`/product/${item._id}`}
                          className={`font-semibold text-lg mb-1 hover:text-amber-600 transition-colors ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-block bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {item.category}
                          </span>
                          {item.weight && (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              theme === 'dark' 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.weight}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={isRemoving === item._id}
                        className={`p-2 rounded-lg transition-colors mt-2 sm:mt-0 ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                        } ${isRemoving === item._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center border rounded-lg ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      }`}>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className={`p-2 transition-colors ${
                            item.quantity <= 1
                              ? 'opacity-50 cursor-not-allowed'
                              : theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className={`px-4 py-2 font-medium min-w-12 text-center ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.stock && item.quantity >= item.stock}
                          className={`p-2 transition-colors ${
                            item.stock && item.quantity >= item.stock
                              ? 'opacity-50 cursor-not-allowed'
                              : theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                        }`}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.originalPrice && (
                          <div className={`text-sm line-through ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            ₹{(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          ₹{item.price} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl shadow-sm border sticky top-24 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Order Summary
              </h3>

              {/* Delivery Info */}
              <div className={`flex items-center space-x-3 p-3 rounded-lg mb-4 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50'
              }`}>
                <Truck className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="font-medium">Free delivery</div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Est. {deliveryEstimate}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className={`flex justify-between ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Subtotal ({getCartItemsCount()} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                {potentialSavings > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>You save</span>
                    <span>-₹{potentialSavings.toFixed(2)}</span>
                  </div>
                )}

                <div className={`flex justify-between ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Delivery fee</span>
                  <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                </div>

                <div className={`flex justify-between ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                {subtotal < 500 && (
                  <div className={`text-sm p-2 rounded ${
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
                  <span>Total</span>
                  <span className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className={`flex items-center space-x-1 text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                <div className={`flex items-center space-x-1 text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Truck className="h-3 w-3" />
                  <span>Fast Delivery</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-lg font-semibold text-center block transition-all duration-200 hover:shadow-lg mb-3"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/menu"
                className={`w-full text-center py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;