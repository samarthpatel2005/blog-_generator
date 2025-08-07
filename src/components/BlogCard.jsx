import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Eye, Heart, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog, viewMode = 'grid', compact = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      y: -5,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.article
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="card p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Content */}
          <div className="flex-1">
            {/* Category */}
            {blog.category && (
              <div className="mb-3">
                <Link
                  to={`/category/${blog.category}`}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
                >
                  {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </Link>
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 leading-tight">
              <Link
                to={`/blog/${blog.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {blog.title}
              </Link>
            </h2>

            {/* Excerpt */}
            <p className="text-gray-600 mb-4 leading-relaxed">
              {truncateText(blog.excerpt, 200)}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <span>{blog.estimatedReadTime} min read</span>
              </div>
              <div className="flex items-center">
                <Eye size={14} className="mr-1" />
                <span>{blog.viewCount}</span>
              </div>
              <div className="flex items-center">
                <Heart size={14} className="mr-1" />
                <span>{blog.likes}</span>
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Tag size={14} className="text-gray-400" />
                {blog.tags.slice(0, 3).map((tag, index) => (
                  <Link
                    key={index}
                    to={`/tag/${tag}`}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
                {blog.tags.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{blog.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Read More Link */}
            <Link
              to={`/blog/${blog.slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group"
            >
              Read more
              <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="lg:w-48 lg:flex-shrink-0">
              <Link to={`/blog/${blog.slug}`}>
                <img
                  src={blog.featuredImage}
                  alt={blog.imageMetadata?.alt || blog.title}
                  className="w-full h-48 lg:h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-full h-48 lg:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg hidden items-center justify-center"
                >
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">📰</div>
                    <div className="text-sm text-gray-600 font-medium">
                      {blog.category?.charAt(0).toUpperCase() + blog.category?.slice(1) || 'News'}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </motion.article>
    );
  }

  // Grid view (default)
  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`card overflow-hidden hover:shadow-xl transition-all duration-300 ${
        compact ? 'h-full' : ''
      }`}
    >
      {/* Featured Image or Placeholder */}
      <div className="relative overflow-hidden">
        {blog.featuredImage ? (
          <Link to={`/blog/${blog.slug}`}>
            <img
              src={blog.featuredImage}
              alt={blog.imageMetadata?.alt || blog.title}
              className={`w-full object-cover hover:scale-105 transition-transform duration-300 ${
                compact ? 'h-40' : 'h-48'
              }`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className={`w-full ${compact ? 'h-40' : 'h-48'} bg-gradient-to-br from-blue-100 to-purple-100 hidden items-center justify-center`}
            >
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📰</div>
                <div className="text-sm text-gray-600 font-medium">
                  {blog.category?.charAt(0).toUpperCase() + blog.category?.slice(1) || 'News'}
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Link to={`/blog/${blog.slug}`}>
            <div className={`w-full ${compact ? 'h-40' : 'h-48'} bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center hover:scale-105 transition-transform duration-300`}>
              <div className="text-center p-4">
                <div className="text-5xl mb-3">🤖</div>
                <div className="text-sm text-gray-700 font-medium">
                  AI Generated
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {blog.category?.charAt(0).toUpperCase() + blog.category?.slice(1) || 'Blog Post'}
                </div>
              </div>
            </div>
          </Link>
        )}
        
        {/* Image Source Attribution */}
        {blog.featuredImage && blog.imageMetadata?.source && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {blog.imageMetadata.source}
          </div>
        )}
        
        {/* Category Badge */}
        {blog.category && (
          <div className="absolute top-4 left-4">
            <Link
              to={`/category/${blog.category}`}
              className="px-3 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-medium rounded-full hover:bg-opacity-100 transition-all"
            >
              {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-6 ${compact ? 'p-4' : ''}`}>
        {/* Category (if no featured image) */}
        {!blog.featuredImage && blog.category && (
          <div className="mb-3">
            <Link
              to={`/category/${blog.category}`}
              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
            >
              {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
            </Link>
          </div>
        )}

        {/* Title */}
        <h2 className={`font-bold text-gray-900 mb-3 leading-tight ${
          compact ? 'text-lg' : 'text-xl'
        }`}>
          <Link
            to={`/blog/${blog.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {compact ? truncateText(blog.title, 60) : blog.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className={`text-gray-600 mb-4 leading-relaxed ${
          compact ? 'text-sm' : ''
        }`}>
          {truncateText(blog.excerpt, compact ? 80 : 120)}
        </p>

        {/* Meta Info */}
        <div className={`flex flex-wrap items-center gap-3 text-gray-500 mb-4 ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          <div className="flex items-center">
            <Calendar size={compact ? 12 : 14} className="mr-1" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <Clock size={compact ? 12 : 14} className="mr-1" />
            <span>{blog.estimatedReadTime} min</span>
          </div>
          {!compact && (
            <>
              <div className="flex items-center">
                <Eye size={14} className="mr-1" />
                <span>{blog.viewCount}</span>
              </div>
              <div className="flex items-center">
                <Heart size={14} className="mr-1" />
                <span>{blog.likes}</span>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && !compact && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Tag size={12} className="text-gray-400" />
            {blog.tags.slice(0, 2).map((tag, index) => (
              <Link
                key={index}
                to={`/tag/${tag}`}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </Link>
            ))}
            {blog.tags.length > 2 && (
              <span className="text-xs text-gray-400">
                +{blog.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Read More Button */}
        <Link
          to={`/blog/${blog.slug}`}
          className={`inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group ${
            compact ? 'text-sm' : ''
          }`}
        >
          Read more
          <ArrowRight size={compact ? 14 : 16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.article>
  );
};

export default BlogCard;