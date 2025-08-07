const axios = require('axios');
require('dotenv').config();

class NewsFetcher {
  constructor() {
    this.apiKey = process.env.GNEWS_API_KEY;
    this.baseUrl = 'https://gnews.io/api/v4';
  }

  async fetchLatestNews(category = 'general', lang = 'en', max = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          category: category,
          lang: lang,
          max: max,
          apikey: this.apiKey
        }
      });

      if (response.data && response.data.articles) {
        return this.formatArticles(response.data.articles);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching news:', error.message);
      throw new Error(`Failed to fetch news: ${error.message}`);
    }
  }

  async searchNews(query, lang = 'en', max = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          lang: lang,
          max: max,
          apikey: this.apiKey
        }
      });

      if (response.data && response.data.articles) {
        return this.formatArticles(response.data.articles);
      }
      
      return [];
    } catch (error) {
      console.error('Error searching news:', error.message);
      throw new Error(`Failed to search news: ${error.message}`);
    }
  }

  formatArticles(articles) {
    return articles.map(article => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
        url: article.source.url
      }
    }));
  }

  async getTopStoriesForBlog(categories = ['technology', 'business', 'science']) {
    try {
      const allArticles = [];
      
      for (const category of categories) {
        const articles = await this.fetchLatestNews(category, 'en', 5);
        allArticles.push(...articles);
      }

      // Remove duplicates and sort by publish date
      const uniqueArticles = this.removeDuplicates(allArticles);
      return uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } catch (error) {
      console.error('Error getting top stories:', error.message);
      throw error;
    }
  }

  removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const key = article.title.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  validateApiKey() {
    if (!this.apiKey) {
      throw new Error('GNews API key is required. Please set GNEWS_API_KEY in your .env file');
    }
  }
}

module.exports = NewsFetcher;