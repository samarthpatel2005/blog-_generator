const moment = require('moment');

function formatPrompt(articles, topic = null) {
  const currentDate = moment().format('MMMM Do, YYYY');
  
  const articlesText = articles.map((article, index) => `
    Article ${index + 1}:
    Title: ${article.title}
    Description: ${article.description}
    Source: ${article.source.name}
    Published: ${moment(article.publishedAt).format('MMMM Do, YYYY')}
    ${article.content ? `Content: ${article.content}` : ''}
  `).join('\n\n');

  const topicSection = topic ? `
    Primary Focus: ${topic}
    Please ensure the blog post specifically addresses trends and developments related to ${topic}.
  ` : '';

  return `
    You are a professional tech and business blogger. Write a comprehensive, engaging blog post based on the following recent news articles.

    Date: ${currentDate}
    ${topicSection}

    News Articles:
    ${articlesText}

    Instructions:
    1. Create an engaging, SEO-friendly title
    2. Write a comprehensive blog post (800-1200 words) that:
       - Analyzes the trends and patterns from these articles
       - Provides insightful commentary and context
       - Uses a professional yet accessible tone
       - Includes relevant subheadings
       - Connects different stories where applicable
    3. Focus on implications for businesses, consumers, or society
    4. Maintain journalistic integrity - don't make claims beyond what's supported
    5. Make it engaging and informative for a general tech-savvy audience

    Format the response as a well-structured blog post with:
    - A compelling headline
    - An engaging introduction
    - Well-organized body sections with subheadings
    - A thoughtful conclusion
    - Natural integration of the source information

    Do not include a separate summary or metadata - just the blog post content itself.
  `;
}

function formatSummaryPrompt(articles) {
  const articlesText = articles.map(article => 
    `${article.title} - ${article.description}`
  ).join('\n');

  return `
    Create a brief, engaging summary (2-3 sentences) of the main themes and trends from these news articles:
    
    ${articlesText}
    
    Focus on the key developments and their potential impact.
  `;
}

function formatTopicPrompt(articles, specificTopic) {
  const articlesText = articles.map(article => `
    - ${article.title}: ${article.description}
  `).join('\n');

  return `
    Based on these news articles:
    ${articlesText}
    
    Write a focused blog post about ${specificTopic}. 
    
    Guidelines:
    - Length: 600-800 words
    - Focus specifically on ${specificTopic} aspects
    - Use evidence from the provided articles
    - Provide analysis and insights
    - Include actionable takeaways where relevant
    - Maintain professional tone
  `;
}

function generateMetaPrompt(blogContent) {
  return `
    Based on this blog post content, generate:
    1. An SEO meta description (150-160 characters)
    2. 5-7 relevant tags/keywords
    3. A social media friendly title (under 60 characters)
    
    Blog content:
    ${blogContent.substring(0, 500)}...
    
    Format as JSON with keys: metaDescription, tags, socialTitle
  `;
}

module.exports = {
  formatPrompt,
  formatSummaryPrompt,
  formatTopicPrompt,
  generateMetaPrompt
};