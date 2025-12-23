import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  User, 
  Cake,
  Truck
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  const openWhatsApp = () => {
    const message = `Hello Ding Dong Cake & Bake! I'm interested in your products.`;
    const whatsappUrl = `https://wa.me/917373042268?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openEmail = () => {
    window.location.href = 'mailto:dingdongcakebake@gmail.com';
  };

  const openPhone = () => {
    window.location.href = 'tel:+917373042268';
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      detail: '+91 73730 42268',
      action: openPhone,
      description: 'Available for orders and inquiries'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      detail: '+91 73730 42268',
      action: openWhatsApp,
      description: 'Quick responses on WhatsApp'
    },
    {
      icon: Mail,
      title: 'Email Us',
      detail: 'dingdongcakebake@gmail.com',
      action: openEmail,
      description: 'Send us your custom cake requests'
    },
    {
      icon: MapPin,
      title: 'Location',
      detail: 'Attur',
      action: null,
      description: 'Based in Attur, serving the local community'
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 9:00 PM' },
    { day: 'Sunday', hours: '9:00 AM - 8:00 PM' }
  ];

  const services = [
    {
      icon: Cake,
      title: 'Custom Cakes',
      description: 'Birthday, Wedding, Anniversary & Theme Cakes'
    },
    {
      icon: Truck,
      title: 'Delivery',
      description: 'Local delivery available in Attur area'
    },
    {
      icon: Clock,
      title: 'Quick Orders',
      description: 'Same-day orders available for select items'
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className={`py-16 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900' 
          : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block p-4 rounded-full mb-6 bg-amber-500/20">
              <MessageCircle className="h-12 w-12 text-amber-600" />
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Get In <span className="text-amber-600">Touch</span>
            </h1>
            <p className={`text-xl md:text-2xl font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              We'd love to hear from you! Let's create something sweet together.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                onClick={item.action}
                className={`p-6 rounded-2xl text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-orange-50 hover:bg-orange-100'
                } ${item.action ? 'hover:border-amber-500 border-2 border-transparent' : ''}`}
              >
                <div className={`inline-block p-3 rounded-full mb-4 ${
                  theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
                }`}>
                  <item.icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.title}
                </h3>
                <p className={`font-medium mb-2 ${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  {item.detail}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-orange-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className={`p-8 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <h2 className={`text-3xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Your Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Tell us about your cake requirements, occasion, or any special requests..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-8">
              {/* Business Hours */}
              <div className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-6 w-6 text-amber-600" />
                  <h3 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-3">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {schedule.day}
                      </span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                      }`}>
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick WhatsApp Action */}
              <div 
                onClick={openWhatsApp}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  theme === 'dark' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <div className="text-center text-white">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Quick WhatsApp Order
                  </h3>
                  <p className="text-green-100 mb-4">
                    Click here to message us directly on WhatsApp for quick orders and inquiries
                  </p>
                  <div className="bg-white text-green-600 py-2 px-4 rounded-lg font-semibold">
                    Chat Now
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <h3 className={`text-xl font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Our Services
                </h3>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
                      }`}>
                        <service.icon className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {service.title}
                        </h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {service.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to Order Your Cake?
            </h2>
            <p className={`text-lg mb-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Contact us today and let's create something delicious together!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={openWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp Now</span>
              </button>
              <Link
                to="/menu"
                className={`border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                  theme === 'dark' ? 'hover:text-white' : ''
                }`}
              >
                View Menu
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;