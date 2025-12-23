import { ShoppingCart, Star, Heart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { theme } = useTheme();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Add wishlist functionality
  };

  const isInCartItem = isInCart(product._id);
  const cartQuantity = getItemQuantity(product._id);

  // Calculate discount percentage
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Stock status
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className={`group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-orange-100'
      } ${isOutOfStock ? 'opacity-70' : ''}`}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        
        <img
          src={imageError ? '/api/placeholder/300/200' : product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {discountPercent}% OFF
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Low Stock
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              Best Seller
            </span>
          )}
        </div>

        {/* Right Side Badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
          }`}>
            {product.category}
          </span>
          {isOutOfStock && (
            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : theme === 'dark'
              ? 'bg-gray-700 text-gray-300 hover:bg-red-500 hover:text-white'
              : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
          } shadow-lg`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={`font-semibold text-lg mb-2 line-clamp-1 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {product.name}
        </h3>
        
        <p className={`text-sm mb-3 line-clamp-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {product.description}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating || 4.5)
                    ? 'text-amber-400 fill-current'
                    : theme === 'dark' 
                    ? 'text-gray-600' 
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className={`text-sm ml-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              ({product.rating || 4.5})
            </span>
          </div>
          {product.reviewCount && (
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {product.reviewCount} reviews
            </span>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-bold ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              }`}>
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className={`text-sm line-through ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {product.weight && (
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {product.weight}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center space-x-1 text-sm font-medium ${
              isOutOfStock
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isInCartItem
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {isOutOfStock 
                ? 'Out of Stock' 
                : isInCartItem 
                ? `(${cartQuantity})` 
                : 'Add'
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;