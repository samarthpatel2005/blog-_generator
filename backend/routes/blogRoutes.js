const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const NewsFetcher = require('../newsFetcher/fetchNews');
const BlogGenerator = require('../blogGenerator/generateBlog');

// Get all published blogs with pagination and advanced filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const tag = req.query.tag;
    const search = req.query.search;
    const sort = req.query.sort || 'newest'; // newest, oldest, popular, trending
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    
    let query = { status: 'published' };
    let sortQuery = {};
    
    // Apply filters
    if (category) {
      query.category = category.toLowerCase();
    }
    
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Sorting logic
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'popular':
        sortQuery = { viewCount: -1, likes: -1 };
        break;
      case 'trending':
        // Recent posts with high engagement
        sortQuery = { 
          $expr: {
            $add: [
              { $multiply: ['$viewCount', 0.7] },
              { $multiply: ['$likes', 0.3] }
            ]
          }
        };
        break;
      case 'reading-time':
        sortQuery = { estimatedReadTime: 1 };
        break;
      default: // newest
        sortQuery = { createdAt: -1 };
    }
    
    const blogs = await Blog.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude full content for list view
    
    const total = await Blog.countDocuments(query);
    
    // Get unique categories and tags for filters
    const categoriesAgg = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const tagsAgg = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.json({
      success: true,
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        categories: categoriesAgg.map(cat => ({ name: cat._id, count: cat.count })),
        tags: tagsAgg.map(tag => ({ name: tag._id, count: tag.count })),
        currentFilters: {
          category,
          tag, 
          search,
          sort,
          dateFrom,
          dateTo
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch blogs' 
    });
  }
});

// Get single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Increment view count
    await blog.incrementView();
    
    // Get related blogs
    const relatedBlogs = await blog.getRelatedBlogs(3);
    
    res.json({
      blog,
      relatedBlogs
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Get popular blogs
router.get('/featured/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const blogs = await Blog.getPopularBlogs(limit);
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching popular blogs:', error);
    res.status(500).json({ error: 'Failed to fetch popular blogs' });
  }
});

// Get recent blogs
router.get('/featured/recent', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 5;
    const blogs = await Blog.getRecentBlogs(days, limit);
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching recent blogs:', error);
    res.status(500).json({ error: 'Failed to fetch recent blogs' });
  }
});

// Get blogs by category
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const blogs = await Blog.findByCategory(req.params.category)
      .skip(skip)
      .limit(limit)
      .select('-content');
    
    const total = await Blog.countDocuments({ 
      category: req.params.category.toLowerCase(),
      status: 'published'
    });
    
    res.json({
      blogs,
      category: req.params.category,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    console.error('Error fetching blogs by category:', error);
    res.status(500).json({ error: 'Failed to fetch blogs by category' });
  }
});

// Get blogs by tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const blogs = await Blog.findByTag(req.params.tag)
      .skip(skip)
      .limit(limit)
      .select('-content');
    
    const total = await Blog.countDocuments({ 
      tags: { $in: [req.params.tag.toLowerCase()] },
      status: 'published'
    });
    
    res.json({
      blogs,
      tag: req.params.tag,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    console.error('Error fetching blogs by tag:', error);
    res.status(500).json({ error: 'Failed to fetch blogs by tag' });
  }
});

// Like a blog
router.post('/:slug/like', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    await blog.addLike();
    res.json({ likes: blog.likes });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ error: 'Failed to like blog' });
  }
});

// Get blog statistics
router.get('/admin/stats', async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments({ status: 'published' });
    const totalViews = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]);
    const totalLikes = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);
    
    const categoryStats = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const recentActivity = await Blog.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt viewCount likes');
    
    res.json({
      totalBlogs,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      categoryStats,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Manual blog generation endpoint
router.post('/admin/generate', async (req, res) => {
  try {
    const { category = 'technology', topic = null, maxArticles = 5 } = req.body;
    
    const newsFetcher = new NewsFetcher();
    const blogGenerator = new BlogGenerator();
    
    // Fetch news articles
    const articles = await newsFetcher.fetchLatestNews(category, 'en', maxArticles);
    
    if (articles.length === 0) {
      return res.status(400).json({ error: 'No articles found for the specified category' });
    }
    
    // Generate blog post
    const blogData = await blogGenerator.generateBlogPost(articles, topic);
    
    // Create new blog entry
    const blog = new Blog({
      title: blogData.title,
      excerpt: blogData.excerpt,
      content: blogData.content,
      tags: blogData.tags,
      category: category.toLowerCase(),
      wordCount: blogData.wordCount,
      estimatedReadTime: blogData.estimatedReadTime,
      sourceArticles: articles.map(article => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt)
      })),
      generationInfo: {
        model: 'gemini-1.5-flash',
        generatedAt: new Date(),
        articlesUsed: articles.length,
        topic: topic
      }
    });
    
    await blog.save();
    
    res.json({
      message: 'Blog generated successfully',
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        tags: blog.tags,
        category: blog.category,
        createdAt: blog.createdAt
      }
    });
  } catch (error) {
    console.error('Error generating blog:', error);
    res.status(500).json({ error: 'Failed to generate blog: ' + error.message });
  }
});

// Get all categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { status: 'published' });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await Blog.distinct('tags', { status: 'published' });
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create a new blog post (for sample data creation)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      tags = [],
      category = 'general',
      status = 'published'
    } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, excerpt, and content are required' 
      });
    }

    const blog = new Blog({
      title,
      excerpt,
      content,
      tags,
      category: category.toLowerCase(),
      status
    });

    await blog.save();

    res.status(201).json({
      message: 'Blog created successfully',
      title: blog.title,
      slug: blog.slug,
      id: blog._id,
      category: blog.category,
      tags: blog.tags,
      wordCount: blog.wordCount,
      estimatedReadTime: blog.estimatedReadTime,
      createdAt: blog.createdAt
    });

  } catch (error) {
    console.error('Error creating blog:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Blog with this title already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create blog: ' + error.message });
  }
});

module.exports = router;