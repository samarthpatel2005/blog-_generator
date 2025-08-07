const cron = require('node-cron');
const NewsFetcher = require('../newsFetcher/fetchNews');
const BlogGenerator = require('../blogGenerator/generateBlog');
const BlogCleanupManager = require('../BlogCleanupManager');
const Blog = require('../models/Blog');

class BlogScheduler {
  constructor() {
    this.newsFetcher = new NewsFetcher();
    this.blogGenerator = new BlogGenerator();
    this.cleanupManager = new BlogCleanupManager();
    this.isRunning = false;
  }

  // Run every Sunday at 9:00 AM
  startWeeklySchedule() {
    console.log('Starting weekly blog generation schedule...');
    
    cron.schedule('0 9 * * 0', async () => {
      console.log('Running weekly blog generation task...');
      await this.generateWeeklyBlogs();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
  }

  // Run daily at 6:00 AM for trending topics
  startDailySchedule() {
    console.log('Starting daily trending blog schedule...');
    
    cron.schedule('0 6 * * *', async () => {
      console.log('Running daily trending blog generation task...');
      await this.generateTrendingBlog();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
  }

  // Run weekly cleanup on Saturdays at 2:00 AM
  startCleanupSchedule() {
    console.log('Starting weekly cleanup schedule...');
    
    cron.schedule('0 2 * * 6', async () => {
      console.log('Running weekly blog cleanup task...');
      await this.runCleanupTasks();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });
  }

  async generateWeeklyBlogs() {
    if (this.isRunning) {
      console.log('Blog generation already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      const categories = ['technology', 'business', 'science'];
      const generatedBlogs = [];

      for (const category of categories) {
        try {
          console.log(`Generating blog for category: ${category}`);
          
          // Fetch articles for the category
          const articles = await this.newsFetcher.fetchLatestNews(category, 'en', 8);
          
          if (articles.length === 0) {
            console.log(`No articles found for category: ${category}`);
            continue;
          }

          // Group articles for better blog generation
          const articleGroups = this.groupArticlesByTopic(articles);
          
          for (const group of articleGroups) {
            const blogData = await this.blogGenerator.generateBlogPost(group.articles, group.topic);
            
            // Check if similar blog already exists (prevent duplicates)
            const existingSimilar = await this.checkForSimilarBlog(blogData.title);
            
            if (existingSimilar) {
              console.log(`Similar blog already exists, skipping: ${blogData.title}`);
              continue;
            }

            const blog = new Blog({
              title: blogData.title,
              excerpt: blogData.excerpt,
              content: blogData.content,
              tags: blogData.tags,
              category: category.toLowerCase(),
              wordCount: blogData.wordCount,
              estimatedReadTime: blogData.estimatedReadTime,
              sourceArticles: group.articles.map(article => ({
                title: article.title,
                url: article.url,
                source: article.source.name,
                publishedAt: new Date(article.publishedAt)
              })),
              generationInfo: {
                model: 'gemini-1.5-flash',
                generatedAt: new Date(),
                articlesUsed: group.articles.length,
                topic: group.topic,
                scheduledGeneration: true
              }
            });

            await blog.save();
            generatedBlogs.push(blog);
            console.log(`Generated blog: ${blog.title}`);

            // Add delay to avoid rate limiting
            await this.delay(3000);
          }
        } catch (error) {
          console.error(`Error generating blog for category ${category}:`, error.message);
        }
      }

      console.log(`Weekly blog generation completed. Generated ${generatedBlogs.length} blogs.`);
      
      // Clean up old blogs if needed
      await this.cleanupOldBlogs();
      
    } catch (error) {
      console.error('Error in weekly blog generation:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async generateTrendingBlog() {
    if (this.isRunning) {
      console.log('Blog generation already in progress, skipping trending blog...');
      return;
    }

    try {
      console.log('Generating trending topic blog...');
      
      // Get trending topics by searching popular keywords
      const trendingKeywords = ['AI', 'blockchain', 'startup', 'innovation', 'tech'];
      const randomKeyword = trendingKeywords[Math.floor(Math.random() * trendingKeywords.length)];
      
      const articles = await this.newsFetcher.searchNews(randomKeyword, 'en', 6);
      
      if (articles.length === 0) {
        console.log('No trending articles found');
        return;
      }

      const blogData = await this.blogGenerator.generateBlogPost(articles, `Trending: ${randomKeyword}`);
      
      const existingSimilar = await this.checkForSimilarBlog(blogData.title);
      if (existingSimilar) {
        console.log('Similar trending blog already exists, skipping');
        return;
      }

      const blog = new Blog({
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        tags: [...blogData.tags, 'trending', randomKeyword.toLowerCase()],
        category: 'technology',
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
          topic: `Trending: ${randomKeyword}`,
          scheduledGeneration: true,
          trendingBlog: true
        }
      });

      await blog.save();
      console.log(`Generated trending blog: ${blog.title}`);
      
    } catch (error) {
      console.error('Error generating trending blog:', error);
    }
  }

  groupArticlesByTopic(articles) {
    // Simple grouping - could be enhanced with ML clustering
    const groups = [];
    const remainingArticles = [...articles];
    
    while (remainingArticles.length > 0) {
      const baseArticle = remainingArticles.shift();
      const group = {
        topic: this.extractTopicFromTitle(baseArticle.title),
        articles: [baseArticle]
      };
      
      // Find related articles
      for (let i = remainingArticles.length - 1; i >= 0; i--) {
        if (this.areArticlesRelated(baseArticle, remainingArticles[i])) {
          group.articles.push(remainingArticles.splice(i, 1)[0]);
        }
        
        // Limit group size
        if (group.articles.length >= 4) break;
      }
      
      groups.push(group);
      
      // Limit number of groups
      if (groups.length >= 2) break;
    }
    
    return groups;
  }

  extractTopicFromTitle(title) {
    const topics = ['AI', 'blockchain', 'startup', 'tech', 'innovation', 'business', 'science'];
    const titleLower = title.toLowerCase();
    
    for (const topic of topics) {
      if (titleLower.includes(topic.toLowerCase())) {
        return topic;
      }
    }
    
    return 'Technology News';
  }

  areArticlesRelated(article1, article2) {
    const commonWords = this.getCommonWords(
      article1.title + ' ' + article1.description,
      article2.title + ' ' + article2.description
    );
    
    return commonWords.length >= 2;
  }

  getCommonWords(text1, text2) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    const words1 = text1.toLowerCase().match(/\b\w+\b/g) || [];
    const words2 = text2.toLowerCase().match(/\b\w+\b/g) || [];
    
    const filteredWords1 = words1.filter(word => word.length > 3 && !stopWords.includes(word));
    const filteredWords2 = words2.filter(word => word.length > 3 && !stopWords.includes(word));
    
    return filteredWords1.filter(word => filteredWords2.includes(word));
  }

  async checkForSimilarBlog(title) {
    const words = title.toLowerCase().split(' ').filter(word => word.length > 3);
    const searchRegex = new RegExp(words.slice(0, 3).join('|'), 'i');
    
    const similar = await Blog.findOne({
      title: searchRegex,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Within last 7 days
    });
    
    return similar !== null;
  }

  async cleanupOldBlogs() {
    try {
      // Keep only the latest 100 blogs, remove older ones
      const totalBlogs = await Blog.countDocuments({ status: 'published' });
      
      if (totalBlogs > 100) {
        const blogsToDelete = await Blog.find({ status: 'published' })
          .sort({ createdAt: 1 })
          .limit(totalBlogs - 100)
          .select('_id');
        
        const idsToDelete = blogsToDelete.map(blog => blog._id);
        await Blog.deleteMany({ _id: { $in: idsToDelete } });
        
        console.log(`Cleaned up ${idsToDelete.length} old blogs`);
      }
    } catch (error) {
      console.error('Error cleaning up old blogs:', error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup tasks
  async runCleanupTasks() {
    try {
      console.log('🧹 Starting automatic blog cleanup...');
      
      // Get current stats
      const stats = await this.cleanupManager.getStats();
      console.log(`📊 Total blogs before cleanup: ${stats.total}`);
      
      // Delete blogs older than 60 days
      const deletedOld = await this.cleanupManager.deleteOldBlogs(60);
      console.log(`🗑️ Deleted ${deletedOld} blogs older than 60 days`);
      
      // Delete low engagement blogs
      const deletedLowEng = await this.cleanupManager.deleteLowEngagementBlogs();
      console.log(`🗑️ Deleted ${deletedLowEng} low engagement blogs`);
      
      // Keep only latest 50 blogs (if we have more than 50)
      const totalAfterOldCleanup = await Blog.countDocuments();
      if (totalAfterOldCleanup > 50) {
        const deletedExcess = await this.cleanupManager.keepLatestBlogs(50);
        console.log(`🗑️ Kept latest 50 blogs, deleted ${deletedExcess} excess blogs`);
      }
      
      // Final stats
      const finalStats = await this.cleanupManager.getStats();
      console.log(`✅ Cleanup completed! Total blogs now: ${finalStats.total}`);
      
    } catch (error) {
      console.error('❌ Cleanup task failed:', error.message);
    }
  }

  // Manual trigger methods
  async runWeeklyGeneration() {
    console.log('Manually triggering weekly blog generation...');
    await this.generateWeeklyBlogs();
  }

  async runTrendingGeneration() {
    console.log('Manually triggering trending blog generation...');
    await this.generateTrendingBlog();
  }

  async runManualCleanup() {
    console.log('Manually triggering blog cleanup...');
    await this.runCleanupTasks();
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      weeklyScheduleActive: true,
      dailyScheduleActive: true,
      cleanupScheduleActive: true,
      nextWeeklyRun: 'Every Sunday at 9:00 AM',
      nextDailyRun: 'Every day at 6:00 AM',
      nextCleanupRun: 'Every Saturday at 2:00 AM'
    };
  }
}

module.exports = BlogScheduler;