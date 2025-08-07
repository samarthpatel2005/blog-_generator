import axios from 'axios';
import { createContext, useContext, useEffect, useReducer } from 'react';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  blogs: [],
  currentBlog: null,
  relatedBlogs: [],
  popularBlogs: [],
  recentBlogs: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    category: null,
    tag: null,
    search: ''
  },
  categories: [],
  tags: []
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_BLOGS: 'SET_BLOGS',
  SET_CURRENT_BLOG: 'SET_CURRENT_BLOG',
  SET_RELATED_BLOGS: 'SET_RELATED_BLOGS',
  SET_POPULAR_BLOGS: 'SET_POPULAR_BLOGS',
  SET_RECENT_BLOGS: 'SET_RECENT_BLOGS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_TAGS: 'SET_TAGS',
  LIKE_BLOG: 'LIKE_BLOG',
  INCREMENT_VIEW: 'INCREMENT_VIEW'
};

// Reducer
const blogReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.SET_BLOGS:
      return { ...state, blogs: action.payload, loading: false, error: null };
    
    case ActionTypes.SET_CURRENT_BLOG:
      return { ...state, currentBlog: action.payload, loading: false, error: null };
    
    case ActionTypes.SET_RELATED_BLOGS:
      return { ...state, relatedBlogs: action.payload };
    
    case ActionTypes.SET_POPULAR_BLOGS:
      return { ...state, popularBlogs: action.payload };
    
    case ActionTypes.SET_RECENT_BLOGS:
      return { ...state, recentBlogs: action.payload };
    
    case ActionTypes.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case ActionTypes.CLEAR_FILTERS:
      return { ...state, filters: initialState.filters };
    
    case ActionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    
    case ActionTypes.SET_TAGS:
      return { ...state, tags: action.payload };
    
    case ActionTypes.LIKE_BLOG:
      return {
        ...state,
        currentBlog: state.currentBlog 
          ? { ...state.currentBlog, likes: action.payload }
          : null,
        blogs: state.blogs.map(blog =>
          blog._id === action.blogId 
            ? { ...blog, likes: action.payload }
            : blog
        )
      };
    
    case ActionTypes.INCREMENT_VIEW:
      return {
        ...state,
        currentBlog: state.currentBlog 
          ? { ...state.currentBlog, viewCount: state.currentBlog.viewCount + 1 }
          : null
      };
    
    default:
      return state;
  }
};

// Create context
const BlogContext = createContext();

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('Frontend API URL:', API_BASE_URL);

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for AWS requests
});

// Request interceptor
api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    
    if (error.response?.status === 404) {
      // Handle 404 errors silently for some cases
      return Promise.reject(error);
    }
    
    toast.error(message);
    return Promise.reject(error);
  }
);

// Provider component
export const BlogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(blogReducer, initialState);

  // Fetch blogs with filters and pagination
  const fetchBlogs = async (page = 1, limit = 12, filters = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const params = {
        page,
        limit,
        ...filters
      };
      
      // Clean up empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] == null || 
            (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });
      
      const response = await api.get('/api/blogs', { params });
      const data = response.data;
      
      dispatch({ type: ActionTypes.SET_BLOGS, payload: data.blogs });
      dispatch({ 
        type: ActionTypes.SET_PAGINATION, 
        payload: {
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalBlogs: data.totalBlogs,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev
        }
      });
      
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Fetch single blog by slug
  const fetchBlog = async (slug) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const response = await api.get(`/api/blogs/${slug}`);
      const data = response.data;
      
      dispatch({ type: ActionTypes.SET_CURRENT_BLOG, payload: data.blog });
      dispatch({ type: ActionTypes.SET_RELATED_BLOGS, payload: data.relatedBlogs });
      
      return data.blog;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Fetch popular blogs
  const fetchPopularBlogs = async (limit = 5) => {
    try {
      const response = await api.get(`/api/blogs/featured/popular?limit=${limit}`);
      dispatch({ type: ActionTypes.SET_POPULAR_BLOGS, payload: response.data });
    } catch (error) {
      console.error('Error fetching popular blogs:', error);
    }
  };

  // Fetch recent blogs
  const fetchRecentBlogs = async (days = 7, limit = 5) => {
    try {
      const response = await api.get(`/api/blogs/featured/recent?days=${days}&limit=${limit}`);
      dispatch({ type: ActionTypes.SET_RECENT_BLOGS, payload: response.data });
    } catch (error) {
      console.error('Error fetching recent blogs:', error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/blogs/meta/categories');
      dispatch({ type: ActionTypes.SET_CATEGORIES, payload: response.data });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      const response = await api.get('/api/blogs/meta/tags');
      dispatch({ type: ActionTypes.SET_TAGS, payload: response.data });
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // Like a blog
  const likeBlog = async (slug) => {
    try {
      const response = await api.post(`/api/blogs/${slug}/like`);
      const blogId = state.currentBlog?._id;
      
      dispatch({ 
        type: ActionTypes.LIKE_BLOG, 
        payload: response.data.likes,
        blogId 
      });
      
      toast.success('Blog liked! ❤️');
      return response.data.likes;
    } catch (error) {
      toast.error('Failed to like blog');
      throw error;
    }
  };

  // Search blogs
  const searchBlogs = async (query, page = 1, limit = 12, additionalFilters = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const params = {
        search: query,
        page,
        limit,
        ...additionalFilters
      };
      
      // Clean up empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] == null || 
            (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });
      
      const response = await api.get('/api/blogs', { params });
      const data = response.data;
      
      dispatch({ type: ActionTypes.SET_BLOGS, payload: data.blogs });
      dispatch({ 
        type: ActionTypes.SET_PAGINATION, 
        payload: {
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalBlogs: data.totalBlogs,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev
        }
      });
      
      dispatch({ type: ActionTypes.SET_FILTERS, payload: { search: query, ...additionalFilters } });
      
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Fetch blogs by category
  const fetchBlogsByCategory = async (category, page = 1, limit = 12, additionalFilters = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const params = {
        category,
        page,
        limit,
        ...additionalFilters
      };
      
      // Clean up empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] == null || 
            (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });
      
      const response = await api.get('/api/blogs', { params });
      const data = response.data;
      
      dispatch({ type: ActionTypes.SET_BLOGS, payload: data.blogs });
      dispatch({ 
        type: ActionTypes.SET_PAGINATION, 
        payload: {
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalBlogs: data.totalBlogs,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev
        }
      });
      
      dispatch({ type: ActionTypes.SET_FILTERS, payload: { category, ...additionalFilters } });
      
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Fetch blogs by tag
  const fetchBlogsByTag = async (tag, page = 1, limit = 12, additionalFilters = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const params = {
        tags: tag,
        page,
        limit,
        ...additionalFilters
      };
      
      // Clean up empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] == null || 
            (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });
      
      const response = await api.get('/api/blogs', { params });
      const data = response.data;
      
      dispatch({ type: ActionTypes.SET_BLOGS, payload: data.blogs });
      dispatch({ 
        type: ActionTypes.SET_PAGINATION, 
        payload: {
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalBlogs: data.totalBlogs,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev
        }
      });
      
      dispatch({ type: ActionTypes.SET_FILTERS, payload: { tag, ...additionalFilters } });
      
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Generate new blog (admin function)
  const generateBlog = async (options = {}) => {
    try {
      const response = await api.post('/api/blogs/admin/generate', options);
      toast.success('New blog generated successfully!');
      
      // Refresh blogs list
      await fetchBlogs();
      
      return response.data;
    } catch (error) {
      toast.error('Failed to generate blog');
      throw error;
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
  };

  // Clear filters
  const clearFilters = () => {
    dispatch({ type: ActionTypes.CLEAR_FILTERS });
  };

  // Clear current blog
  const clearCurrentBlog = () => {
    dispatch({ type: ActionTypes.SET_CURRENT_BLOG, payload: null });
    dispatch({ type: ActionTypes.SET_RELATED_BLOGS, payload: [] });
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchPopularBlogs();
    fetchRecentBlogs();
  }, []);

  // Context value
  const value = {
    ...state,
    // Actions
    fetchBlogs,
    fetchBlog,
    fetchPopularBlogs,
    fetchRecentBlogs,
    fetchCategories,
    fetchTags,
    likeBlog,
    searchBlogs,
    fetchBlogsByCategory,
    fetchBlogsByTag,
    generateBlog,
    setFilters,
    clearFilters,
    clearCurrentBlog
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};

// Custom hook to use the blog context
export const useBlog = () => {
  const context = useContext(BlogContext);
  
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  
  return context;
};

export default BlogContext;