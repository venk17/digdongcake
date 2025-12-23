import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import OrderDetails from './pages/OrderDetails';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme } = useTheme();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Check if current route is admin route to hide header/footer
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-orange-50 text-gray-900'
    }`}>
      {/* Conditionally render Header for non-admin routes */}
      {!isAdminRoute && <Header />}
      
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success/:orderId" element={<Success />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />   
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Add a 404 fallback route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-xl mb-4">Page Not Found</p>
                <a 
                  href="/" 
                  className={`inline-block px-6 py-3 rounded-lg font-medium ${
                    theme === 'dark' 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  } transition-colors`}
                >
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>

      {/* Conditionally render Footer for non-admin routes */}
      {!isAdminRoute && <Footer />}
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#fff',
            color: theme === 'dark' ? '#fff' : '#1f2937',
            border: '1px solid #d97706',
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: theme === 'dark' 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: theme === 'dark' ? '#1f2937' : '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: theme === 'dark' ? '#1f2937' : '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#d97706',
              secondary: theme === 'dark' ? '#1f2937' : '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;