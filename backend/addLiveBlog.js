const mongoose = require('mongoose');
const NewsFetcher = require('./newsFetcher/fetchNews');
const BlogGenerator = require('./blogGenerator/generateBlog');
const Blog = require('./models/Blog');
require('dotenv').config();

async function generateAndAddBlog(category = 'science') {
  const categories = {
    technology: 'Latest Technology Trends',
    business: 'Business and Market Analysis', 
    science: 'Scientific Discoveries and Research'
  };

  try {
    console.log(`🚀 Starting ${category} blog generation with live APIs...\n`);

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB\n');

    // Initialize API classes
    const newsFetcher = new NewsFetcher();
    const blogGenerator = new BlogGenerator();

    // Fetch latest news for specified category
    console.log(`📰 Fetching latest ${category} news from GNews...`);
    const articles = await newsFetcher.fetchLatestNews(category, 'en', 5);
    
    if (articles.length === 0) {
      throw new Error('No articles found');
    }

    console.log(`✅ Found ${articles.length} articles:`);
    articles.forEach((article, i) => {
      console.log(`   ${i + 1}. ${article.title.substring(0, 60)}...`);
    });

    // Generate blog using Gemini 1.5 Flash
    console.log('\n🤖 Generating blog content with Gemini 1.5 Flash...');
    const blogData = await blogGenerator.generateBlogPost(articles, categories[category] || 'Latest News Trends');

    console.log('✅ Blog generated successfully!');
    console.log(`   Title: "${blogData.title.substring(0, 80)}..."`);
    console.log(`   Word Count: ${blogData.wordCount}`);
    console.log(`   Read Time: ${blogData.estimatedReadTime} minutes`);
    console.log(`   Tags: ${blogData.tags.join(', ')}`);
    console.log(`   Featured Image: ${blogData.featuredImage ? 'Yes' : 'No'}`);
    if (blogData.featuredImage) {
      console.log(`   Image Source: ${blogData.imageMetadata?.source || 'Unknown'}`);
    }

    // Fix title if it's too long (database limit is 200 characters)
    let finalTitle = blogData.title;
    if (finalTitle.length > 200) {
      // Extract a proper title from the first sentence
      const firstSentence = finalTitle.split('.')[0];
      finalTitle = firstSentence.length > 180 ? 
        firstSentence.substring(0, 180) + '...' : 
        firstSentence + '.';
      
      console.log(`   📝 Title shortened to: "${finalTitle}"`);
    }

    // Generate slug manually to ensure it's created
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);
    };

    const blogSlug = generateSlug(finalTitle);
    console.log(`   🔗 Generated slug: "${blogSlug}"`);

    // Create blog entry in database
    console.log('\n💾 Saving blog to database...');
    const blog = new Blog({
      title: finalTitle,
      slug: blogSlug,
      excerpt: blogData.excerpt,
      content: blogData.content,
      tags: blogData.tags,
      category: category,
      featuredImage: blogData.featuredImage,
      imageMetadata: blogData.imageMetadata,
      wordCount: blogData.wordCount,
      estimatedReadTime: blogData.estimatedReadTime,
      sourceArticles: articles.map(article => ({
        title: article.title,
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: new Date(article.publishedAt || Date.now()),
        image: article.urlToImage,
        imageAlt: article.title
      })),
      generationInfo: {
        model: 'gemini-1.5-flash',
        generatedAt: new Date(),
        articlesUsed: articles.length,
        topic: categories[category] || 'Latest News Trends',
        category: category,
        manualGeneration: true
      }
    });

    await blog.save();

    console.log('✅ Blog saved successfully!');
    console.log(`   Database ID: ${blog._id}`);
    console.log(`   Slug: ${blog.slug}`);
    console.log(`   URL: http://localhost:3000/blog/${blog.slug}`);

    // Check total blogs in database
    const totalBlogs = await Blog.countDocuments();
    console.log(`\n📚 Total blogs in database: ${totalBlogs}`);

    console.log('\n🎉 New blog successfully added using live APIs!');
    console.log('🌐 You can now view it on your website.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('💡 Check your API keys in .env file');
    } else if (error.message.includes('quota')) {
      console.log('💡 API quota limit reached');
    } else if (error.message.includes('network')) {
      console.log('💡 Check your internet connection');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

console.log('🚀 Generating new blog with live GNews + Gemini 1.5 Flash APIs...');

// Get category from command line argument or default to technology
const args = process.argv.slice(2);
const category = args[0] || 'technology';

const validCategories = ['technology', 'business', 'science'];
if (!validCategories.includes(category)) {
  console.log('❌ Invalid category. Valid options: technology, business, science');
  console.log('Usage: node addLiveBlog.js [category]');
  console.log('Example: node addLiveBlog.js business');
  process.exit(1);
}

generateAndAddBlog(category);
