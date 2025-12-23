import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategory = searchParams.get('category') || 'all';

  const categories = [
    { id: 'all', name: 'All Products', icon: '🍽️' },
    { id: 'cakes', name: 'Cakes', icon: '🎂' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'brownies', name: 'Brownies', icon: '🍫' },
    { id: 'cupcakes', name: 'Cupcakes', icon: '🧁' },
    { id: 'custom', name: 'Custom Cakes', icon: '🎨' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  useEffect(() => {
    // Simulate loading with timer like in Contact component
    const timer = setTimeout(() => {
      fetchProducts();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, searchTerm, sortBy, priceRange]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://digdongcake.onrender.com/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback mock data
      setProducts(generateMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (category) => {
    setSearchParams(category === 'all' ? {} : { category });
    setShowFilters(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange([min, max]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('name');
    setPriceRange([0, 5000]);
    setSearchParams({});
  };

  // Mock data generator for fallback
  const generateMockProducts = () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Chocolate Fudge Cake',
        description: 'Rich chocolate cake with fudge frosting',
        price: 599,
        originalPrice: 699,
        image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
        category: 'cakes',
        rating: 4.8,
        reviewCount: 124,
        stock: 10,
        weight: '1kg',
        isBestSeller: true
      },
      {
        _id: '2',
        name: 'Margherita Pizza',
        description: 'Fresh tomato sauce and mozzarella',
        price: 299,
        image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
        category: 'pizza',
        rating: 4.6,
        reviewCount: 156,
        stock: 15,
        isBestSeller: true
      },
      {
        _id: '3',
        name: 'Double Chocolate Brownie',
        description: 'Rich chocolate brownie with chocolate chips',
        price: 199,
        image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg',
        category: 'brownies',
        rating: 4.7,
        reviewCount: 89,
        stock: 20
      }
    ];
    return mockProducts;
  };

  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return products.length;
    return products.filter(p => p.category === categoryId).length;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Same design as Contact component */}
      <section className={`py-16 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900' 
          : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block p-4 rounded-full mb-6 bg-amber-500/20">
              <span className="text-4xl">🎂</span>
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Our <span className="text-amber-600">Menu</span>
            </h1>
            <p className={`text-xl md:text-2xl font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Explore our delicious collection of freshly baked goods and custom creations
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={`py-16 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-orange-50'
      }`}>
        <div className="container mx-auto px-4">
          {/* Search and Controls */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search for cakes, pizzas, brownies..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                {/* View Toggle */}
                <div className={`flex border rounded-lg ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? theme === 'dark' 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-amber-500 text-white'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list'
                        ? theme === 'dark' 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-amber-500 text-white'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    showFilters
                      ? theme === 'dark'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-amber-500 text-white border-amber-500'
                      : theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Range */}
                  <div>
                    <h4 className={`font-medium mb-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Price Range
                    </h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(priceRange[0], parseInt(e.target.value))}
                        className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          ₹{priceRange[0]}
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          ₹{priceRange[1]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Filters */}
                  <div>
                    <h4 className={`font-medium mb-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Active Filters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategory !== 'all' && (
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          theme === 'dark' ? 'bg-amber-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {categories.find(c => c.id === selectedCategory)?.name}
                        </span>
                      )}
                      {searchTerm && (
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          Search: "{searchTerm}"
                        </span>
                      )}
                      <button
                        onClick={clearFilters}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-amber-600 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className={`text-sm ${
                    selectedCategory === category.id ? 'text-amber-200' : 'text-gray-400'
                  }`}>
                    ({getCategoryCount(category.id)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className={`text-6xl mb-4 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                🔍
              </div>
              <h3 className={`text-2xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                No Products Found
              </h3>
              <p className={`mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearFilters}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                  : 'space-y-6'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
              
              {/* Results Summary */}
              <div className="text-center mt-12">
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Showing {filteredProducts.length} of {products.length} products
                  {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;