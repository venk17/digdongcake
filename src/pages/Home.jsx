import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChefHat, Clock, Star, Heart, Truck, Shield } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import logo from "../assets/logo.png"

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      const allProducts = response.data;
      setProducts(allProducts.slice(0, 6)); // Show only first 6 products
      setFeaturedProducts(allProducts.filter(product => product.isFeatured).slice(0, 3));
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback mock data for demo
      setProducts(generateMockProducts());
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data generator
  const generateMockProducts = () => {
    return [
      {
        _id: '1',
        name: 'Chocolate Fudge Cake',
        description: 'Rich chocolate cake with fudge frosting',
        price: 599,
        originalPrice: 699,
        image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
        category: 'Cakes',
        rating: 4.8,
        reviewCount: 124,
        stock: 10,
        weight: '1kg',
        isBestSeller: true
      },
      {
        _id: '2',
        name: 'Red Velvet Cake',
        description: 'Classic red velvet with cream cheese frosting',
        price: 649,
        image: 'https://images.pexels.com/photos/132694/pexels-photo-132694.jpeg',
        category: 'Cakes',
        rating: 4.7,
        reviewCount: 89,
        stock: 8,
        weight: '1kg'
      },
      {
        _id: '3',
        name: 'Margherita Pizza',
        description: 'Fresh tomato sauce and mozzarella',
        price: 299,
        image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
        category: 'Pizza',
        rating: 4.6,
        reviewCount: 156,
        stock: 15,
        isBestSeller: true
      }
    ];
  };

  const features = [
    {
      icon: ChefHat,
      title: 'Expert Bakers',
      description: 'Our skilled bakers create masterpieces with love and precision'
    },
    {
      icon: Clock,
      title: 'Fresh Daily',
      description: 'Everything is baked fresh daily using premium ingredients'
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every item is crafted with passion and attention to detail'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: '100% satisfaction guarantee on all our products'
    },
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Only the finest ingredients used in our recipes'
    }
  ];

  const stats = [
    { number: '5000+', label: 'Happy Customers' },
    { number: '1000+', label: 'Custom Cakes' },
    { number: '50+', label: 'Varieties' },
    { number: '4.8', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative h-[80vh] flex items-center justify-center overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900' 
          : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'
      }`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1600')"
          }}
        ></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <div className={`inline-block p-3 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-500/20'
            }`}>
               <img 
                  src={logo} 
                  alt="Ding Dong Cake & Bake Logo"
                    className="h-24 w-auto object-contain" 
                />
            </div>
            <h1 className={`text-5xl md:text-7xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="text-amber-600">DING DONG</span><br />
              <span className={`text-3xl md:text-4xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                CAKE & BAKE
              </span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Premium Cakes • Custom Cakes • Brownies • Pizza
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/menu"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-semibold flex items-center space-x-2 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <span>Explore Menu</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/menu?category=custom"
              className={`border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                theme === 'dark' ? 'hover:text-white' : ''
              }`}
            >
              Custom Cakes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-12 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  {stat.number}
                </div>
                <div className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-orange-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose Us?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              We're committed to delivering the finest baked goods with exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`inline-block p-4 rounded-full mb-4 ${
                  theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
                }`}>
                  <feature.icon className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Popular Products
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Discover our most loved cakes, pizzas, and baked goods that keep our customers coming back
            </p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-semibold inline-flex items-center space-x-2 transition-all duration-300 hover:shadow-lg"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className={`py-16 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-orange-50'
        }`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Featured Products
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Special selections that showcase our best work and creativity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Need a Custom Cake?
            </h2>
            <p className={`text-lg mb-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Let us create the perfect cake for your special occasion. From birthdays to weddings, 
              we bring your vision to life with our custom cake designs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu?category=custom"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-semibold inline-flex items-center space-x-2 transition-all duration-300 hover:shadow-lg"
              >
                <span>Order Custom Cake</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className={`border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                  theme === 'dark' ? 'hover:text-white' : ''
                }`}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;