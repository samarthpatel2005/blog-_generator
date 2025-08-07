import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Pages
import Home from './pages/Home';
import BlogPage from './pages/BlogPage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';

// Context
import { BlogProvider } from './context/BlogContext';

function App() {
  return (
    <BlogProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <ScrollToTop />
          
          {/* Header */}
          <Header />
          
          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/category/:category" element={<Home />} />
              <Route path="/tag/:tag" element={<Home />} />
              <Route path="/search" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.main>
          
          {/* Footer */}
          <Footer />
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#374151',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                }
              }
            }}
          />
        </div>
      </Router>
    </BlogProvider>
  );
}

// 404 Not Found Component
const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="text-8xl mb-4">🤖</div>
          <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. It might have been moved, 
            deleted, or you entered the wrong URL.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <button
              onClick={() => window.history.back()}
              className="btn-secondary mr-4"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Go Home
            </button>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-sm text-gray-500"
        >
          <p>Need help? Try searching for what you need or browse our latest articles.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default App;