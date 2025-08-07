import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Filter, RotateCcw, Tag, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FilterPanel = ({ isOpen, onClose }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    dateRange: searchParams.get('dateRange') || 'all'
  });

  const [availableCategories] = useState([
    { id: 'technology', name: 'Technology', icon: '💻', count: 45 },
    { id: 'business', name: 'Business', icon: '💼', count: 32 },
    { id: 'science', name: 'Science', icon: '🔬', count: 28 },
    { id: 'health', name: 'Health', icon: '🏥', count: 21 },
    { id: 'environment', name: 'Environment', icon: '🌱', count: 18 }
  ]);

  const [availableTags] = useState([
    'AI', 'Machine Learning', 'Blockchain', 'Startup', 'Innovation',
    'Climate Change', 'Healthcare', 'Fintech', 'Cybersecurity', 'IoT',
    'Data Science', 'Cloud Computing', 'Mobile', 'Web Development'
  ]);

  const sortOptions = [
    { value: 'createdAt', label: 'Latest First', icon: '📅' },
    { value: 'title', label: 'Alphabetical', icon: '🔤' },
    { value: 'readingTime', label: 'Reading Time', icon: '⏱️' },
    { value: 'relevance', label: 'Most Relevant', icon: '🎯' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    // Update filters when URL parameters change
    setFilters({
      category: searchParams.get('category') || '',
      tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      dateRange: searchParams.get('dateRange') || 'all'
    });
  }, [searchParams]);

  const handleCategoryChange = (categoryId) => {
    const newFilters = {
      ...filters,
      category: filters.category === categoryId ? '' : categoryId
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleSortChange = (sortBy) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleSortOrderToggle = () => {
    const newSortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
    const newFilters = { ...filters, sortOrder: newSortOrder };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleDateRangeChange = (dateRange) => {
    const newFilters = { ...filters, dateRange };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Clear previous filter params
    params.delete('category');
    params.delete('tags');
    params.delete('sortBy');
    params.delete('sortOrder');
    params.delete('dateRange');

    // Add new filter params
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','));
    if (newFilters.sortBy !== 'createdAt') params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder !== 'desc') params.set('sortOrder', newFilters.sortOrder);
    if (newFilters.dateRange !== 'all') params.set('dateRange', newFilters.dateRange);

    navigate(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      tags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      dateRange: 'all'
    };
    setFilters(clearedFilters);
    
    // Keep search query but clear filters
    const params = new URLSearchParams();
    const searchQuery = searchParams.get('q');
    if (searchQuery) params.set('q', searchQuery);
    
    navigate(`/?${params.toString()}`);
  };

  const hasActiveFilters = filters.category || filters.tags.length > 0 || 
    filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc' || 
    filters.dateRange !== 'all';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="mr-2 text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <RotateCcw size={14} className="mr-1" />
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {availableCategories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        filters.category === category.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Tag size={16} className="mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <motion.button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.tags.includes(tag)
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUp size={16} className="mr-2" />
                  Sort By
                </h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full flex items-center p-3 rounded-lg border transition-all ${
                        filters.sortBy === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-lg mr-3">{option.icon}</span>
                      <span className="flex-1 text-left">{option.label}</span>
                      {filters.sortBy === option.value && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSortOrderToggle();
                          }}
                          className="ml-2 p-1 text-sm bg-blue-100 text-blue-600 rounded"
                        >
                          {filters.sortOrder === 'desc' ? '↓' : '↑'}
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Date Range
                </h3>
                <div className="space-y-2">
                  {dateRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleDateRangeChange(range.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        filters.dateRange === range.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel;
