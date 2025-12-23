import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Cake, Heart, Coffee, Award, Users, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

const About = () => {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { icon: Cake, number: '500+', label: 'Custom Cakes Made' },
    { icon: Users, number: '1000+', label: 'Happy Customers' },
    { icon: Award, number: '50+', label: 'Cake Varieties' },
    { icon: Coffee, number: 'Coming Soon', label: 'Cafe Location' }
  ];

  const skills = [
    { name: 'Custom Cake Design', level: 95 },
    { name: 'Fondant Art', level: 90 },
    { name: 'Buttercream Mastery', level: 92 },
    { name: 'Bread & Pizza Making', level: 88 },
    { name: 'Gourmet Desserts', level: 85 },
    { name: 'Customer Satisfaction', level: 98 }
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
              <ChefHat className="h-12 w-12 text-amber-600" />
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              About <span className="text-amber-600">Ding Dong Cake</span>
            </h1>
            <p className={`text-xl md:text-2xl font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Crafting Sweet Memories with Passion and Precision
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image Section */}
              <div className="relative">
                <div className={`rounded-2xl overflow-hidden shadow-2xl ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-orange-50'
                }`}>
                  <img
                    src="https://images.pexels.com/photos/887853/pexels-photo-887853.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Hanish - Founder of Ding Dong Cake"
                    className="w-full h-96 object-cover"
                  />
                </div>
                <div className={`absolute -bottom-6 -right-6 p-6 rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-amber-600' : 'bg-amber-500'
                }`}>
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Story Section */}
              <div>
                <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Meet Hanish
                </h2>
                <div className={`space-y-4 text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <p>
                    Hi, I'm <strong>Hanish</strong> from <strong>Attur</strong>, the founder and head baker behind <strong>Ding Dong Cake</strong>.
                  </p>
                  <p>
                    Baking is my passion, and I completed a <strong>Professional Master Baking Course</strong> with comprehensive hands-on training. 
                    I've mastered everything from delicate sponges and rich frostings to intricate buttercream, smooth ganache, and creative fondant art.
                  </p>
                  <p>
                    My expertise extends to cookies, artisan breads, delicious pizzas, gourmet desserts, decadent brownies, and much more.
                  </p>
                  <p>
                    At <strong>Ding Dong Cake</strong>, every dessert is <strong>fresh, homemade, hygienic, and beautifully crafted</strong> with both love and professional skill.
                  </p>
                  <div className={`p-4 rounded-lg mt-6 ${
                    theme === 'dark' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-amber-100 border border-amber-200'
                  }`}>
                    <p className={`font-semibold flex items-center space-x-2 ${
                      theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      <Coffee className="h-5 w-5" />
                      <span>Exciting News: Planning to open my own café soon!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-orange-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-block p-3 rounded-full mb-4 ${
                  theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
                }`}>
                  <stat.icon className="h-6 w-6 text-amber-600" />
                </div>
                <div className={`text-2xl md:text-3xl font-bold mb-2 ${
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

      {/* Skills Section */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Baking Expertise
              </h2>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Professional skills mastered through dedicated training and practice
              </p>
            </div>

            <div className="space-y-6">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {skill.name}
                    </span>
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      {skill.level}%
                    </span>
                  </div>
                  <div className={`h-3 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={`py-16 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-orange-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mission */}
              <div className={`p-8 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <div className="inline-block p-3 rounded-full mb-4 bg-amber-500/20">
                  <Heart className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Our Mission
                </h3>
                <p className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  To create exceptional baked goods that bring joy to every occasion, using only the finest ingredients 
                  and combining traditional techniques with creative innovation.
                </p>
              </div>

              {/* Vision */}
              <div className={`p-8 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <div className="inline-block p-3 rounded-full mb-4 bg-amber-500/20">
                  <Coffee className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Future Vision
                </h3>
                <p className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  To establish Ding Dong Cake as a beloved local café where customers can enjoy premium baked goods 
                  in a warm, welcoming atmosphere that feels like home.
                </p>
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
              Ready to Taste the Difference?
            </h2>
            <p className={`text-lg mb-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Experience the passion and quality that goes into every Ding Dong Cake creation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Explore Our Menu
              </Link>
              <Link
                to="/contact"
                className={`border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                  theme === 'dark' ? 'hover:text-white' : ''
                }`}
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className={`py-12 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-orange-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-amber-600" />
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Attur
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-amber-600" />
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Available for Orders
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;