import { motion } from 'framer-motion';
import { Archive, Calendar, CheckCircle, Clock, Mail, Tag, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useBlog } from '../context/BlogContext';

const Sidebar = () => {
  const { blogs, categories, tags, fetchBlogs } = useBlog();
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Get recent blogs (last 5)
    if (blogs && blogs.length > 0) {
      setRecentBlogs(blogs.slice(0, 5));
      
      // Calculate popular tags
      const tagCount = {};
      blogs.forEach(blog => {
        if (blog.tags) {
          blog.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      });
      
      const sortedTags = Object.entries(tagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ name: tag, count }));
      
      setPopularTags(sortedTags);
    }
  }, [blogs]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubscription = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/subscription/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setIsSubscribed(true);
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
          <Clock className="mr-2" size={20} />
          Recent Posts
        </h3>
        <div className="space-y-4">
          {recentBlogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-100 pb-3 last:border-b-0"
            >
              <a 
                href={`/blog/${blog.slug}`}
                className="block group"
              >
                <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {blog.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar size={12} className="mr-1" />
                  {formatDate(blog.createdAt)}
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
          <Archive className="mr-2" size={20} />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <motion.a
              key={category.name}
              href={`/category/${category.name}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm text-gray-700 group-hover:text-blue-600 capitalize">
                {category.name}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Popular Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
          <TrendingUp className="mr-2" size={20} />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, index) => (
            <motion.a
              key={tag.name}
              href={`/tag/${tag.name}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              <Tag size={12} className="mr-1" />
              {tag.name}
              <span className="ml-1 text-blue-600">({tag.count})</span>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Newsletter Signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Mail className="mr-2" size={20} />
          Stay Updated
        </h3>
        <p className="text-sm text-blue-100 mb-4">
          Get the latest AI-generated blog posts delivered to your inbox.
        </p>
        
        {isSubscribed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <CheckCircle className="mx-auto mb-2 text-green-300" size={40} />
            <p className="text-lg font-semibold">Thank you!</p>
            <p className="text-sm text-blue-100">You're now subscribed to our updates.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubscription} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubscribing}
              className="w-full px-3 py-2 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              required
            />
            <button 
              type="submit"
              disabled={isSubscribing}
              className="w-full bg-white text-blue-600 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubscribing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Sidebar;
