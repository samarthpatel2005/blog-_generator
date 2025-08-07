import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Bot, Home, Tag, Folder } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { categories } = useBlog();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Technology', path: '/category/technology', icon: Tag },
    { name: 'Business', path: '/category/business', icon: Folder },
    { name: 'Science', path: '/category/science', icon: Tag },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white bg-opacity-95 backdrop-blur-md shadow-lg border-b border-white border-opacity-20' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="flex items-center space-x-3 text-xl lg:text-2xl font-bold"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="gradient-text">AutoBlogger</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : scrolled 
                          ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                          : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Search Button & Mobile Menu Toggle */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/search')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Search size={20} />
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    : 'text-white hover:text-blue-200 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-purple-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">AutoBlogger</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6">
                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                            isActive(item.path)
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <Icon size={20} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Categories */}
                  {categories.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Categories
                      </h3>
                      <div className="space-y-1">
                        {categories.slice(0, 5).map((category) => (
                          <Link
                            key={category}
                            to={`/category/${category}`}
                            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive(`/category/${category}`)
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </nav>

                {/* Footer */}
                <div className="p-6 bg-gray-50">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Powered by AI Technology
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">
                        Generating fresh content
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default Header;