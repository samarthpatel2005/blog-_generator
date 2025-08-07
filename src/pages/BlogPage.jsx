import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Components
import BlogCard from '../components/BlogCard';
import ShareButtons from '../components/ShareButtons';
import LoadingSpinner from '../components/LoadingSpinner';

// Context
import { useBlog } from '../context/BlogContext';

// Icons
import { 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Tag, 
  ArrowLeft, 
  Share2,
  BookOpen,
  User
} from 'lucide-react';

const BlogPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  const {
    currentBlog: blog,
    relatedBlogs,
    loading,
    error,
    fetchBlog,
    likeBlog,
    clearCurrentBlog
  } = useBlog();

  useEffect(() => {
    if (slug) {
      fetchBlog(slug).catch(() => {
        // Handle 404 or other errors
        navigate('/404', { replace: true });
      });
    }
    
    return () => {
      clearCurrentBlog();
    };
  }, [slug]);

  const handleLike = async () => {
    if (isLiking || !blog) return;
    
    setIsLiking(true);
    try {
      await likeBlog(blog.slug);
    } catch (error) {
      console.error('Error liking blog:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Article not found</h2>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title}</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {blog.featuredImage && (
          <meta property="og:image" content={blog.featuredImage} />
        )}
        <meta name="article:published_time" content={blog.createdAt} />
        <meta name="article:author" content="Auto Blogger AI" />
        {blog.tags && blog.tags.map(tag => (
          <meta key={tag} name="article:tag" content={tag} />
        ))}
      </Helmet>

      <article className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </motion.button>
        </div>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
        >
          <div className="text-center mb-8">
            {/* Category */}
            {blog.category && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
            >
              {blog.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              {blog.excerpt}
            </motion.p>

            {/* Article Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-8"
            >
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                <span>Auto Blogger AI</span>
              </div>
              
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>{blog.estimatedReadTime} min read</span>
              </div>
              
              <div className="flex items-center">
                <Eye size={16} className="mr-2" />
                <span>{blog.viewCount} views</span>
              </div>
              
              <div className="flex items-center">
                <BookOpen size={16} className="mr-2" />
                <span>{blog.wordCount} words</span>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isLiking
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105'
                }`}
              >
                <Heart 
                  size={18} 
                  className={`${isLiking ? 'animate-pulse' : ''}`}
                />
                <span>{blog.likes}</span>
              </button>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
                
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 z-10"
                  >
                    <ShareButtons
                      url={window.location.href}
                      title={blog.title}
                      onClose={() => setShowShareMenu(false)}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                <Tag size={16} className="text-gray-400 mr-2" />
                {blog.tags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/tag/${tag}`)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Featured Image */}
        {blog.featuredImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
          >
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-64 sm:h-96 object-cover rounded-xl shadow-lg"
            />
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="card p-8 lg:p-12 mb-12">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1: ({children}) => (
                    <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({children}) => (
                    <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({children}) => (
                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({children}) => (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({children}) => (
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({children}) => (
                    <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6 bg-blue-50 py-4 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  a: ({children, href}) => (
                    <a 
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Source Articles */}
          {blog.sourceArticles && blog.sourceArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="card p-6 mb-12"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Sources & References
              </h3>
              <div className="space-y-3">
                {blog.sourceArticles.map((source, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        {source.title}
                      </a>
                      <div className="text-sm text-gray-500 mt-1">
                        {source.source} • {formatDate(source.publishedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Generation Info */}
          {blog.generationInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="card p-6 mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  AI-Generated Content
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                This article was automatically generated using advanced AI technology, 
                analyzing and synthesizing information from {blog.generationInfo.articlesUsed} recent news articles.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>Model: {blog.generationInfo.model}</span>
                <span>Generated: {formatDate(blog.generationInfo.generatedAt)}</span>
                {blog.generationInfo.topic && (
                  <span>Focus: {blog.generationInfo.topic}</span>
                )}
              </div>
            </motion.div>
          )}

          {/* Related Articles */}
          {relatedBlogs && relatedBlogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog, index) => (
                  <motion.div
                    key={relatedBlog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <BlogCard blog={relatedBlog} viewMode="grid" compact />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom Share */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="card p-6 text-center"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Enjoyed this article?
            </h4>
            <p className="text-gray-600 mb-6">
              Share it with others who might find it interesting!
            </p>
            <div className="flex items-center justify-center">
              <ShareButtons
                url={window.location.href}
                title={blog.title}
                horizontal
              />
            </div>
          </motion.div>
        </motion.div>
      </article>
    </>
  );
};

export default BlogPage;