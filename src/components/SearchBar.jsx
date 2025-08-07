import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Filter, Search, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SearchBar = ({ className = '', onFiltersToggle }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const popularSearches = [
    { term: 'AI', icon: '🤖', category: 'technology' },
    { term: 'Machine Learning', icon: '🧠', category: 'technology' },
    { term: 'Blockchain', icon: '⛓️', category: 'technology' },
    { term: 'Startup', icon: '🚀', category: 'business' },
    { term: 'Innovation', icon: '💡', category: 'general' },
    { term: 'Climate Science', icon: '🌍', category: 'science' }
  ];

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      setIsExpanded(true);
    }
    
    // Load recent searches from localStorage
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (searchTerm) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newRecent = [
      searchTerm,
      ...recent.filter(term => term !== searchTerm)
    ].slice(0, 5);
    
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    setRecentSearches(newRecent);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    navigate('/');
    setIsExpanded(false);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    saveRecentSearch(term);
    navigate(`/?q=${encodeURIComponent(term)}`);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const handleFocus = () => {
    setIsExpanded(true);
    setShowSuggestions(true);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <motion.form
        onSubmit={handleSearch}
        className="relative"
        initial={false}
        animate={isExpanded ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search blogs, topics, technologies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            className="w-full pl-12 pr-20 py-3 text-sm border-2 border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-md"
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            )}
            
            {onFiltersToggle && (
              <button
                type="button"
                onClick={onFiltersToggle}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Filter size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.form>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 max-h-80 overflow-y-auto"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock size={14} className="mr-2" />
                    Recent Searches
                  </h4>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(term)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <TrendingUp size={14} className="mr-2" />
                Popular Topics
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {popularSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.term)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.term}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
