import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

// Components
import BlogCard from '../components/BlogCard';
import FilterPanel from '../components/FilterPanel';
import FilterTags from '../components/FilterTags';
import HeroSection from '../components/HeroSection';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import Sidebar from '../components/Sidebar';

// Context
import { useBlog } from '../context/BlogContext';

// Icons
import { Filter, Grid, List, X } from 'lucide-react';

const Home = () => {
  const { category, tag } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = searchParams.get('q');
  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const {
    blogs,
    loading,
    error,
    pagination,
    filters,
    fetchBlogs,
    fetchBlogsByCategory,
    fetchBlogsByTag,
    searchBlogs,
    clearFilters
  } = useBlog();

  // Fetch blogs based on route and query params
  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    
    // Extract all filter parameters from URL
    const urlFilters = {
      category: searchParams.get('category') || undefined,
      tags: searchParams.get('tags') || undefined,
      search: searchParams.get('q') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      dateRange: searchParams.get('dateRange') || undefined
    };
    
    // Clean up undefined values
    Object.keys(urlFilters).forEach(key => {
      if (urlFilters[key] === undefined) {
        delete urlFilters[key];
      }
    });

    // Use the unified fetchBlogs function with filters
    if (category) {
      fetchBlogsByCategory(category, page, 12, urlFilters);
    } else if (tag) {
      fetchBlogsByTag(tag, page, 12, urlFilters);
    } else if (searchQuery) {
      searchBlogs(searchQuery, page, 12, urlFilters);
    } else {
      fetchBlogs(page, 12, urlFilters);
    }
  }, [category, tag, searchQuery, searchParams, location]);

  // Clear filters when navigating to home
  useEffect(() => {
    if (!category && !tag && !searchQuery) {
      clearFilters();
    }
  }, [category, tag, searchQuery]);

  // Get page title and description
  const getPageInfo = () => {
    if (category) {
      return {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Articles`,
        description: `Latest ${category} articles and insights`
      };
    }
    if (tag) {
      return {
        title: `#${tag}`,
        description: `Articles tagged with ${tag}`
      };
    }
    if (searchQuery) {
      return {
        title: `Search Results for "${searchQuery}"`,
        description: `Found ${pagination.totalBlogs} articles matching "${searchQuery}"`
      };
    }
    return {
      title: 'AI-Powered Blog Generator',
      description: 'Stay updated with the latest tech news and insights powered by artificial intelligence'
    };
  };

  const pageInfo = getPageInfo();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageInfo.title}</title>
        <meta name="description" content={pageInfo.description} />
        <meta property="og:title" content={pageInfo.title} />
        <meta property="og:description" content={pageInfo.description} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section - only show on main home page */}
        {!category && !tag && !searchQuery && <HeroSection />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {pageInfo.title}
                </h1>
                <p className="text-gray-600">{pageInfo.description}</p>
                
                {/* Results count */}
                {pagination.totalBlogs > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {pagination.totalBlogs} {pagination.totalBlogs === 1 ? 'article' : 'articles'}
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`lg:hidden btn-secondary ${showFilters ? 'bg-blue-500 text-white' : ''}`}
                >
                  <Filter size={18} className="mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(category || tag || searchQuery) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 flex flex-wrap items-center gap-2"
              >
                <span className="text-sm text-gray-600 mr-2">Active filters:</span>
                
                {category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Category: {category}
                    <button
                      onClick={() => window.history.pushState({}, '', '/')}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                
                {tag && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Tag: {tag}
                    <button
                      onClick={() => window.history.pushState({}, '', '/')}
                      className="ml-2 hover:text-purple-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => window.history.pushState({}, '', '/')}
                      className="ml-2 hover:text-green-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <SearchBar 
              onFiltersToggle={() => setShowFilterPanel(true)}
            />
          </motion.div>

          {/* Filter Panel */}
          <FilterPanel 
            isOpen={showFilterPanel}
            onClose={() => setShowFilterPanel(false)}
          />

          {/* Main Content */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : blogs.length > 0 ? (
                <>
                  {/* Filter Tags */}
                  <div className="mb-6">
                    <FilterTags />
                  </div>

                  {/* Blog Grid/List */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'
                        : 'space-y-6 mb-8'
                    }
                  >
                    {blogs.map((blog, index) => (
                      <motion.div
                        key={blog._id}
                        variants={itemVariants}
                        transition={{ delay: index * 0.05 }}
                      >
                        <BlogCard blog={blog} viewMode={viewMode} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Pagination />
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    No articles found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? `We couldn't find any articles matching "${searchQuery}". Try different keywords.`
                      : 'No articles available at the moment. Check back later for fresh content!'
                    }
                  </p>
                  {(category || tag || searchQuery) && (
                    <button
                      onClick={() => window.history.pushState({}, '', '/')}
                      className="btn-primary"
                    >
                      View All Articles
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className={`lg:col-span-4 ${showFilters ? 'block' : 'hidden lg:block'} mt-8 lg:mt-0`}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Sidebar />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;