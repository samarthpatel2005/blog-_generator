import { motion } from 'framer-motion';
import { Github, Heart, Linkedin, Mail, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Auto Blogger
            </h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Your AI-powered blog generator that creates engaging content from trending news and topics. 
              Stay ahead with automated, quality blog posts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="/category/technology" className="text-gray-300 hover:text-white transition-colors">Technology</a></li>
              <li><a href="/category/business" className="text-gray-300 hover:text-white transition-colors">Business</a></li>
              <li><a href="/category/science" className="text-gray-300 hover:text-white transition-colors">Science</a></li>
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><a href="/category/innovation" className="text-gray-300 hover:text-white transition-colors">Innovation</a></li>
              <li><a href="/category/startup" className="text-gray-300 hover:text-white transition-colors">Startup</a></li>
              <li><a href="/category/general" className="text-gray-300 hover:text-white transition-colors">General</a></li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-400 text-sm mb-4 sm:mb-0">
            © {currentYear} Auto Blogger. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center">
            Made with <Heart size={16} className="text-red-500 mx-1" /> by Auto Blogger Team
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
