const { GoogleGenerativeAI } = require('@google/generative-ai');
const { formatPrompt } = require('../utils/formatPrompt');
require('dotenv').config();

class BlogGenerator {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Updated to use Gemini 1.5 Flash Latest
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateBlogPost(articles, topic = null) {
    try {
      this.validateApiKey();
      
      if (!articles || articles.length === 0) {
        throw new Error('No articles provided for blog generation');
      }

      const prompt = formatPrompt(articles, topic);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const blogContent = response.text();

      const parsedContent = this.parseBlogContent(blogContent);
      const selectedImage = this.selectBestImage(articles);

      return {
        ...parsedContent,
        featuredImage: selectedImage.url,
        imageMetadata: selectedImage.metadata
      };
    } catch (error) {
      console.error('Error generating blog post:', error.message);
      throw new Error(`Failed to generate blog post: ${error.message}`);
    }
  }

  async generateMultipleBlogs(articlesGroups, topics = []) {
    try {
      const blogs = [];
      
      for (let i = 0; i < articlesGroups.length; i++) {
        const articles = articlesGroups[i];
        const topic = topics[i] || null;
        
        const blog = await this.generateBlogPost(articles, topic);
        blogs.push(blog);
        
        // Add delay to avoid rate limiting
        await this.delay(2000);
      }
      
      return blogs;
    } catch (error) {
      console.error('Error generating multiple blogs:', error.message);
      throw error;
    }
  }

  parseBlogContent(content) {
    try {
      // Try to extract structured content
      const lines = content.split('\n').filter(line => line.trim());
      
      let title = '';
      let excerpt = '';
      let body = '';
      let tags = [];
      
      // Extract title (usually the first significant line)
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && line.length > 10) {
          title = line.replace(/^#+\s*/, '').trim();
          break;
        }
      }
      
      // If no title found, generate one from first sentence
      if (!title && lines.length > 0) {
        title = lines[0].substring(0, 100) + '...';
      }
      
      // Extract body (everything after title)
      const bodyStartIndex = lines.findIndex(line => 
        line.trim() === title || line.includes(title)
      ) + 1;
      
      body = lines.slice(bodyStartIndex).join('\n').trim();
      
      // Generate excerpt from first paragraph
      const firstParagraph = body.split('\n\n')[0];
      excerpt = firstParagraph.length > 200 
        ? firstParagraph.substring(0, 200) + '...'
        : firstParagraph;
      
      // Extract tags (look for common tech/business terms)
      const commonTags = ['technology', 'business', 'innovation', 'AI', 'startup', 'science', 'news'];
      const contentLower = content.toLowerCase();
      tags = commonTags.filter(tag => contentLower.includes(tag.toLowerCase()));
      
      return {
        title: title || 'Generated Blog Post',
        excerpt: excerpt || 'A comprehensive analysis of current news and trends.',
        content: body || content,
        tags: tags.length > 0 ? tags : ['general', 'news'],
        wordCount: this.countWords(body || content),
        estimatedReadTime: Math.ceil(this.countWords(body || content) / 200)
      };
    } catch (error) {
      // Fallback parsing
      return {
        title: 'Generated Blog Post',
        excerpt: content.substring(0, 200) + '...',
        content: content,
        tags: ['general', 'news'],
        wordCount: this.countWords(content),
        estimatedReadTime: Math.ceil(this.countWords(content) / 200)
      };
    }
  }

  countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  selectBestImage(articles) {
    // Filter articles that have images
    const articlesWithImages = articles.filter(article => 
      article.urlToImage && 
      article.urlToImage.trim() !== '' &&
      this.isValidImageUrl(article.urlToImage)
    );

    if (articlesWithImages.length === 0) {
      return {
        url: null,
        metadata: {
          alt: 'Blog post image',
          source: 'Generated content',
          caption: 'AI-generated blog content'
        }
      };
    }

    // Prioritize images from certain sources or with specific characteristics
    const prioritizedArticle = articlesWithImages.find(article => 
      article.source?.name && 
      ['TechCrunch', 'Reuters', 'BBC', 'CNN', 'The Verge'].includes(article.source.name)
    ) || articlesWithImages[0];

    return {
      url: prioritizedArticle.urlToImage,
      metadata: {
        alt: `${prioritizedArticle.title.substring(0, 100)}...`,
        source: prioritizedArticle.source?.name || 'News Source',
        caption: `Image from ${prioritizedArticle.source?.name || 'news source'}: ${prioritizedArticle.title.substring(0, 80)}...`
      }
    };
  }

  isValidImageUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const pathname = parsedUrl.pathname.toLowerCase();
      
      // Check if URL has valid image extension or is from known image services
      return validExtensions.some(ext => pathname.includes(ext)) || 
             url.includes('images') || 
             url.includes('img') ||
             url.includes('photo') ||
             parsedUrl.hostname.includes('cdn');
    } catch (error) {
      return false;
    }
  }

  async generateSummary(articles) {
    try {
      const summaryPrompt = `
        Please provide a brief summary of the following news articles in 2-3 sentences:
        
        ${articles.map(article => `- ${article.title}: ${article.description}`).join('\n')}
        
        Focus on the main trends and key developments.
      `;
      
      const result = await this.model.generateContent(summaryPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating summary:', error.message);
      return 'Summary unavailable';
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  validateApiKey() {
    if (!this.apiKey) {
      throw new Error('Gemini API key is required. Please set GEMINI_API_KEY in your .env file');
    }
  }
}

module.exports = BlogGenerator;