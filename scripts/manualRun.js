#!/usr/bin/env node

const mongoose = require('mongoose');
const NewsFetcher = require('../backend/newsFetcher/fetchNews');
const BlogGenerator = require('../backend/blogGenerator/generateBlog');
const Blog = require('../backend/models/Blog');
require('dotenv').config();

class ManualBlogRunner {
  constructor() {
    this.newsFetcher = new NewsFetcher();
    this.blogGenerator = new BlogGenerator();
  }

  async connectDatabase() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-blogger';
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }

  async generateSingleBlog(category = 'technology', topic = null, maxArticles = 5) {
    try {
      console.log(`🔍 Fetching ${maxArticles} articles for category: ${category}`);
      
      const articles = await this.newsFetcher.fetchLatestNews(category, 'en', maxArticles);
      
      if (articles.length === 0) {
        console.log('❌ No articles found for the specified category');
        return null;
      }
      
      console.log(`📰 Found ${articles.length} articles:`);
      articles.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title}`);
      });
      
      console.log('\n🤖 Generating blog post...');
      const blogData = await this.blogGenerator.generateBlogPost(articles, topic);
      
      console.log(`📝 Generated blog: "${blogData.title}"`);
      console.log(`📊 Word count: ${blogData.wordCount}`);
      console.log(`⏱️  Estimated read time: ${blogData.estimatedReadTime} minutes`);
      console.log(`🏷️  Tags: ${blogData.tags.join(', ')}`);
      
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
          model: 'gemini-pro',
          generatedAt: new Date(),
          articlesUsed: articles.length,
          topic: topic,
          manualGeneration: true
        }
      });
      
      await blog.save();
      console.log(`✅ Blog saved successfully with ID: ${blog._id}`);
      console.log(`🔗 Slug: ${blog.slug}`);
      
      return blog;
    } catch (error) {
      console.error('❌ Error generating blog:', error.message);
      throw error;
    }
  }

  async generateMultipleBlogs(categories, options = {}) {
    const {
      articlesPerCategory = 5,
      delayBetweenBlogs = 3000
    } = options;
    
    try {
      console.log(`🚀 Starting bulk blog generation for ${categories.length} categories`);
      const results = [];
      
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`\n📖 Processing category ${i + 1}/${categories.length}: ${category}`);
        
        try {
          const blog = await this.generateSingleBlog(category, null, articlesPerCategory);
          if (blog) {
            results.push(blog);
            console.log(`✅ Successfully generated blog for ${category}`);
          }
          
          // Add delay between generations to avoid rate limiting
          if (i < categories.length - 1) {
            console.log(`⏳ Waiting ${delayBetweenBlogs/1000} seconds before next generation...`);
            await this.delay(delayBetweenBlogs);
          }
        } catch (error) {
          console.error(`❌ Failed to generate blog for ${category}:`, error.message);
        }
      }
      
      console.log(`\n🎉 Bulk generation completed! Generated ${results.length}/${categories.length} blogs`);
      return results;
    } catch (error) {
      console.error('❌ Error in bulk generation:', error.message);
      throw error;
    }
  }

  async searchAndGenerateBlog(searchQuery, maxArticles = 8) {
    try {
      console.log(`🔍 Searching for articles with query: "${searchQuery}"`);
      
      const articles = await this.newsFetcher.searchNews(searchQuery, 'en', maxArticles);
      
      if (articles.length === 0) {
        console.log('❌ No articles found for the search query');
        return null;
      }
      
      console.log(`📰 Found ${articles.length} articles for "${searchQuery}"`);
      
      const blogData = await this.blogGenerator.generateBlogPost(articles, `Focus: ${searchQuery}`);
      
      const blog = new Blog({
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        tags: [...blogData.tags, searchQuery.toLowerCase()],
        category: 'general',
        wordCount: blogData.wordCount,
        estimatedReadTime: blogData.estimatedReadTime,
        sourceArticles: articles.map(article => ({
          title: article.title,
          url: article.url,
          source: article.source.name,
          publishedAt: new Date(article.publishedAt)
        })),
        generationInfo: {
          model: 'gemini-pro',
          generatedAt: new Date(),
          articlesUsed: articles.length,
          topic: `Search: ${searchQuery}`,
          manualGeneration: true
        }
      });
      
      await blog.save();
      console.log(`✅ Search-based blog saved: "${blog.title}"`);
      
      return blog;
    } catch (error) {
      console.error('❌ Error in search-based generation:', error.message);
      throw error;
    }
  }

  async listRecentBlogs(limit = 10) {
    try {
      const blogs = await Blog.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title slug createdAt category tags viewCount likes');
      
      console.log(`\n📚 Recent ${blogs.length} blogs:`);
      blogs.forEach((blog, index) => {
        console.log(`${index + 1}. ${blog.title}`);
        console.log(`   Category: ${blog.category} | Tags: ${blog.tags.join(', ')}`);
        console.log(`   Created: ${blog.createdAt.toLocaleDateString()} | Views: ${blog.viewCount} | Likes: ${blog.likes}`);
        console.log(`   Slug: ${blog.slug}\n`);
      });
      
      return blogs;
    } catch (error) {
      console.error('❌ Error listing blogs:', error.message);
      throw error;
    }
  }

  async getBlogStats() {
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
      
      console.log('\n📊 Blog Statistics:');
      console.log(`Total Blogs: ${totalBlogs}`);
      console.log(`Total Views: ${totalViews[0]?.total || 0}`);
      console.log(`Total Likes: ${totalLikes[0]?.total || 0}`);
      console.log('\nCategory Distribution:');
      categoryStats.forEach(stat => {
        console.log(`  ${stat._id}: ${stat.count} blogs`);
      });
      
      return {
        totalBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        categoryStats
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup() {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// CLI Interface
async function main() {
  const runner = new ManualBlogRunner();
  
  try {
    await runner.connectDatabase();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'generate':
      case 'gen':
        {
          const category = args[1] || 'technology';
          const topic = args[2] || null;
          const maxArticles = parseInt(args[3]) || 5;
          
          console.log(`🚀 Generating single blog...`);
          await runner.generateSingleBlog(category, topic, maxArticles);
        }
        break;
        
      case 'bulk':
        {
          const categories = args.slice(1);
          if (categories.length === 0) {
            categories.push('technology', 'business', 'science');
          }
          
          console.log(`🚀 Generating bulk blogs for categories: ${categories.join(', ')}`);
          await runner.generateMultipleBlogs(categories);
        }
        break;
        
      case 'search':
        {
          const query = args.slice(1).join(' ');
          if (!query) {
            console.log('❌ Please provide a search query');
            break;
          }
          
          console.log(`🔍 Generating blog based on search: "${query}"`);
          await runner.searchAndGenerateBlog(query);
        }
        break;
        
      case 'list':
        {
          const limit = parseInt(args[1]) || 10;
          await runner.listRecentBlogs(limit);
        }
        break;
        
      case 'stats':
        {
          await runner.getBlogStats();
        }
        break;
        
      case 'help':
      case '--help':
      case '-h':
      default:
        {
          console.log(`
📝 Auto-Blogger Manual Runner

Usage: node scripts/manualRun.js <command> [options]

Commands:
  generate|gen [category] [topic] [maxArticles]
    Generate a single blog post
    Examples:
      node scripts/manualRun.js generate
      node scripts/manualRun.js gen technology "AI trends" 8
      node scripts/manualRun.js gen business null 6

  bulk [category1] [category2] ...
    Generate multiple blogs for different categories
    Examples:
      node scripts/manualRun.js bulk
      node scripts/manualRun.js bulk technology business science
      node scripts/manualRun.js bulk startup innovation

  search <query>
    Generate blog based on search results
    Examples:
      node scripts/manualRun.js search "artificial intelligence"
      node scripts/manualRun.js search "blockchain technology"
      node scripts/manualRun.js search "startup funding"

  list [limit]
    List recent blogs
    Examples:
      node scripts/manualRun.js list
      node scripts/manualRun.js list 20

  stats
    Show blog statistics
    Example:
      node scripts/manualRun.js stats

  help
    Show this help message

Available Categories:
  - general      General news and topics
  - technology   Technology and tech industry
  - business     Business and finance
  - science      Science and research
  - health       Health and medicine
  - sports       Sports and athletics
  - entertainment Entertainment and media

Environment Variables Required:
  - GNEWS_API_KEY: Your GNews API key
  - GEMINI_API_KEY: Your Google Gemini API key
  - MONGODB_URI: MongoDB connection string (optional, defaults to local)

Examples:
  # Generate a tech blog with default settings
  npm run manual generate

  # Generate a business blog about startups with 10 articles
  npm run manual generate business "startup trends" 10

  # Generate blogs for multiple categories
  npm run manual bulk technology business science

  # Search and generate blog about AI
  npm run manual search "artificial intelligence trends"

  # List the 15 most recent blogs
  npm run manual list 15

  # Show statistics
  npm run manual stats
`);
        }
        break;
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted. Cleaning up...');
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ManualBlogRunner;