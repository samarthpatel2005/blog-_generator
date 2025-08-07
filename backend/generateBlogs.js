const mongoose = require('mongoose');
const NewsFetcher = require('./newsFetcher/fetchNews');
const BlogGenerator = require('./blogGenerator/generateBlog');
const Blog = require('./models/Blog');
require('dotenv').config();

// Available categories with their topics
const CATEGORIES = {
  technology: {
    name: 'Technology',
    topics: ['Latest Technology Trends', 'AI and Machine Learning', 'Software Development', 'Tech Innovation'],
    newsCategory: 'technology'
  },
  business: {
    name: 'Business',
    topics: ['Business Strategy', 'Market Analysis', 'Entrepreneurship', 'Corporate News'],
    newsCategory: 'business'
  },
  science: {
    name: 'Science',
    topics: ['Scientific Discoveries', 'Research Breakthroughs', 'Health and Medicine', 'Climate Science'],
    newsCategory: 'science'
  }
};

async function generateBlogForCategory(category) {
  const categoryInfo = CATEGORIES[category];
  if (!categoryInfo) {
    throw new Error(`Invalid category: ${category}`);
  }

  console.log(`\n🔬 Generating ${categoryInfo.name} Blog...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Initialize API classes
  const newsFetcher = new NewsFetcher();
  const blogGenerator = new BlogGenerator();

  // Fetch latest news for the category
  console.log(`📰 Fetching latest ${categoryInfo.name.toLowerCase()} news from GNews...`);
  const articles = await newsFetcher.fetchLatestNews(categoryInfo.newsCategory, 'en', 5);
  
  if (articles.length === 0) {
    throw new Error(`No ${categoryInfo.name.toLowerCase()} articles found`);
  }

  console.log(`✅ Found ${articles.length} articles:`);
  articles.forEach((article, i) => {
    console.log(`   ${i + 1}. ${article.title.substring(0, 60)}...`);
  });

  // Select a random topic for this category
  const randomTopic = categoryInfo.topics[Math.floor(Math.random() * categoryInfo.topics.length)];
  
  // Generate blog using Gemini 1.5 Flash
  console.log(`\n🤖 Generating blog content with topic: "${randomTopic}"...`);
  const blogData = await blogGenerator.generateBlogPost(articles, randomTopic);

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
    const firstSentence = finalTitle.split('.')[0];
    finalTitle = firstSentence.length > 180 ? 
      firstSentence.substring(0, 180) + '...' : 
      firstSentence + '.';
    
    console.log(`   📝 Title shortened to: "${finalTitle}"`);
  }

  // Generate slug manually
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
      topic: randomTopic,
      category: category,
      manualGeneration: true
    }
  });

  await blog.save();

  console.log('✅ Blog saved successfully!');
  console.log(`   Database ID: ${blog._id}`);
  console.log(`   Category: ${categoryInfo.name}`);
  console.log(`   Slug: ${blog.slug}`);
  console.log(`   URL: http://localhost:3000/blog/${blog.slug}`);

  return blog;
}

async function generateMultipleBlogs() {
  try {
    console.log('🚀 Starting multi-category blog generation with live APIs...\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB\n');

    const generatedBlogs = [];
    const categories = Object.keys(CATEGORIES);

    // Generate one blog for each category
    for (const category of categories) {
      try {
        const blog = await generateBlogForCategory(category);
        generatedBlogs.push({
          category,
          blog,
          success: true
        });

        // Add delay between generations to avoid rate limiting
        console.log('\n⏳ Waiting 3 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`❌ Failed to generate ${category} blog:`, error.message);
        generatedBlogs.push({
          category,
          error: error.message,
          success: false
        });
      }
    }

    // Summary report
    console.log('\n📊 GENERATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const successful = generatedBlogs.filter(result => result.success);
    const failed = generatedBlogs.filter(result => !result.success);

    console.log(`✅ Successfully generated: ${successful.length} blogs`);
    successful.forEach(result => {
      console.log(`   • ${CATEGORIES[result.category].name}: ${result.blog.title.substring(0, 50)}...`);
    });

    if (failed.length > 0) {
      console.log(`\n❌ Failed generations: ${failed.length}`);
      failed.forEach(result => {
        console.log(`   • ${CATEGORIES[result.category].name}: ${result.error}`);
      });
    }

    // Check total blogs in database
    const totalBlogs = await Blog.countDocuments();
    console.log(`\n📚 Total blogs in database: ${totalBlogs}`);

    console.log('\n🎉 Multi-category blog generation completed!');
    console.log('🌐 You can now view all blogs on your website.');

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

async function generateSingleBlog(category) {
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

    const blog = await generateBlogForCategory(category);

    // Check total blogs in database
    const totalBlogs = await Blog.countDocuments();
    console.log(`\n📚 Total blogs in database: ${totalBlogs}`);

    console.log(`\n🎉 ${CATEGORIES[category].name} blog successfully added!`);
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

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'all') {
  console.log('🚀 Generating blogs for all categories (Technology, Business, Science)...');
  generateMultipleBlogs();
} else if (command && CATEGORIES[command]) {
  console.log(`🚀 Generating ${CATEGORIES[command].name} blog...`);
  generateSingleBlog(command);
} else {
  console.log('📋 Blog Generation Commands:');
  console.log('');
  console.log('Generate all categories:');
  console.log('  node generateBlogs.js all');
  console.log('');
  console.log('Generate specific category:');
  console.log('  node generateBlogs.js technology');
  console.log('  node generateBlogs.js business');
  console.log('  node generateBlogs.js science');
  console.log('');
  console.log('Available categories:', Object.keys(CATEGORIES).join(', '));
  
  // Default: generate all if no arguments
  console.log('\n🚀 No command specified, generating all categories...');
  generateMultipleBlogs();
}
