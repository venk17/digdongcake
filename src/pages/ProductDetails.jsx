import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  Clock,
  Zap,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { theme } = useTheme();

  const cartQuantity = getItemQuantity ? getItemQuantity(id) : 0;
  const isInCartItem = isInCart ? isInCart(id) : false;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`https://digdongcake.onrender.com/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta);
    if (product.stock && newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
        toast.success('Product shared successfully!');
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const features = [
    { icon: Truck, text: 'Free delivery on orders above ₹500' },
    { icon: Clock, text: 'Delivery in 30-45 minutes' },
    { icon: Shield, text: '100% quality guarantee' },
    { icon: Zap, text: 'Freshly baked daily' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <div className={`text-6xl mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            🍰
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Product Not Found
          </h2>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock === 0 || product.isAvailable === false;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium transition-colors`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-full transition-colors ${
                isWishlisted
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleShare}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={product.images ? product.images[selectedImage] : product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-amber-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                {discountPercent > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Best Seller
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                )}
                {product.stock && product.stock > 0 && product.stock <= 5 && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {product.name}
              </h1>
              
              {/* Rating and Reviews */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 4.5)
                            ? 'text-amber-400 fill-current'
                            : theme === 'dark' 
                              ? 'text-gray-600' 
                              : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {product.rating || 4.5}/5
                  </span>
                </div>
                {product.reviewCount && (
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    ({product.reviewCount} reviews)
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className={`text-xl line-through ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    ₹{product.originalPrice}
                  </span>
                )}
                {product.weight && (
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    • {product.weight}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className={`text-xl font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Description
              </h3>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {product.description}
              </p>
            </div>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <feature.icon className="h-4 w-4 text-amber-600" />
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Quantity
                </h3>
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center border rounded-lg ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className={`p-3 transition-colors ${
                        quantity <= 1 
                          ? 'opacity-50 cursor-not-allowed' 
                          : theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className={`px-6 py-3 font-medium text-lg ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={product.stock && quantity >= product.stock}
                      className={`p-3 transition-colors ${
                        product.stock && quantity >= product.stock
                          ? 'opacity-50 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  }`}>
                    Total: ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center space-x-3 px-8 py-4 rounded-lg font-semibold transition-all duration-300 ${
                    isOutOfStock
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : isInCartItem
                      ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg'
                      : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-lg'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {isOutOfStock 
                      ? 'Out of Stock' 
                      : isInCartItem 
                      ? `Added (${cartQuantity})` 
                      : 'Add to Cart'
                    }
                  </span>
                </button>
              </div>

              {isInCartItem && (
                <div className={`flex items-center space-x-2 text-sm ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                  <CheckCircle className="h-4 w-4" />
                  <span>This item is in your cart ({cartQuantity})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;