import { motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';

const FilterTags = ({ className = '' }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();
  const { categories, tags } = useBlog();
  const navigate = useNavigate();

  const availableCategories = [
    'technology', 'business', 'science', 'innovation', 'startup', 'general'
  ];

  const popularTags = [
    'AI', 'Machine Learning', 'Blockchain', 'Cloud Computing', 'Cybersecurity',
    'Data Science', 'IoT', 'Mobile', 'Web Development', 'Startup'
  ];

  useEffect(() => {
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    
    if (category) {
      setSelectedCategory(category);
    }
    if (tag) {
      setSelectedTags([tag]);
    }
  }, [searchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateURL({ category, tags: selectedTags });
  };

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    updateURL({ category: selectedCategory, tags: newTags });
  };

  const updateURL = ({ category, tags }) => {
    const params = new URLSearchParams();
    
    // Keep existing search query
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    if (category) {
      params.set('category', category);
    }
    
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    }
    
    const queryString = params.toString();
    navigate(`/?${queryString}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTags([]);
    
    // Keep only search query
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
  };

  const hasActiveFilters = selectedCategory || selectedTags.length > 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Tag className="mr-2" size={20} />
          Filters
        </h3>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 transition-colors flex items-center"
          >
            <X size={16} className="mr-1" />
            Clear All
          </motion.button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
              }`}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                Category: {selectedCategory}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </motion.span>
            )}
            {selectedTags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 hover:text-purple-600"
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FilterTags;
