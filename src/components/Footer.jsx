import { Cake, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Heart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";

const Footer = () => {
  const { theme } = useTheme();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Cart', path: '/cart' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const categories = [
    'Birthday Cakes',
    'Wedding Cakes',
    'Custom Cakes',
    'Brownies',
    'Pizza',
    'Cupcakes'
  ];

  const socialLinks = [
    { icon: Facebook, url: '#', name: 'Facebook' },
    { icon: Instagram, url: 'https://www.instagram.com/_ding_dong_cake_/?utm_source=qr&igsh=MWQzZTRteXlhcW82dQ%3D%3D#', name: 'Instagram' },
    { icon: Twitter, url: '#', name: 'Twitter' },
  ];

  const paymentMethods = ['Visa', 'MasterCard', 'UPI', 'Net Banking', 'Cash on Delivery'];

  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200'} border-t`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-amber-500 rounded-full">
                <img 
                  src={logo} 
                  alt="Ding Dong Cake & Bake Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  DING DONG CAKE & BAKE
                </h3>
                <p className="text-amber-600 text-sm font-medium">
                  Premium Cakes • Custom Cakes • Brownies • Pizza
                </p>
                <p className="text-red-500 text-sm font-semibold">
                  🎉 Custom Pre-Book 24/7 Available
                </p>
              </div>
            </div>

            <p className={`text-sm leading-relaxed mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Creating delightful moments with our premium baked goods. Fresh ingredients and love in every bite.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`text-sm transition-colors hover:text-amber-600 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className={`text-sm transition-colors hover:text-amber-600 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Contact Info
            </h4>

            <div className="space-y-3">

              <div className={`flex items-start space-x-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <MapPin className="h-4 w-4 text-amber-600 mt-0.5" />
                <span>
                  245, Gandhinagar, Attur,<br />
                  Salem (DT), Tamil Nadu
                </span>
              </div>

              <div className={`flex items-start space-x-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <Phone className="h-4 w-4 text-amber-600" />
                <span>+91 73730 42268</span>
              </div>

              <div className={`flex items-start space-x-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <Mail className="h-4 w-4 text-amber-600" />
                <div className="flex flex-col">
                  <span>dingdongcakebake@gmail.com</span>
                </div>
              </div>
            </div>

           {/* Opening Hours */}
<div className="mt-6">
  <h5 className={`font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
    <Clock className="h-4 w-4 text-amber-600 mr-2" />
    Opening Hours
  </h5>

  <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>

    <div className="flex justify-between">
      <span>Monday - Friday:</span>
      <span>9:00 AM - 8:00 PM</span>
    </div>

    <div className="flex justify-between">
      <span>Saturday:</span>
      <span>9:00 AM - 9:00 PM</span>
    </div>

    <div className="flex justify-between">
      <span>Sunday:</span>
      <span>9:00 AM - 8:00 PM</span>
    </div>

  </div>
</div>


          </div>
        </div>

        {/* Payment + Follow Us (Replaced Subscribe Section) */}
        <div className={`mt-8 pt-8 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-orange-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">

            {/* Payment Methods */}
            <div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                We Accept:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className={`px-2 py-1 text-xs rounded ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* ⭐ Replaced Subscribe with Social Media */}
            <div className="text-center">
              <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                Follow Us
              </h4>

              <div className="flex justify-center space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target='_blank'
                    className={`p-2 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-amber-500 text-gray-300 hover:text-white'
                        : 'bg-orange-100 hover:bg-amber-500 text-gray-600 hover:text-white'
                    }`}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>

              {/* Delivery Line */}
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                🚚 Delivery Available in Attur & Nearby Areas
              </p>
            </div>

          </div>
        </div>

        {/* Copyright */}
        <div className={`mt-8 pt-8 border-t text-center text-sm ${
          theme === 'dark'
            ? 'border-gray-700 text-gray-400'
            : 'border-orange-200 text-gray-600'
        }`}>
          <p>
            &copy; {new Date().getFullYear()} Ding Dong Cake & Bake. All rights reserved. |
            Made with <Heart className="h-3 w-3 inline mx-1 text-red-500" /> for sweet moments
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
