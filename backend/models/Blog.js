const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  category: {
    type: String,
    default: 'general',
    enum: ['technology', 'business', 'science', 'general', 'innovation', 'startup']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  featuredImage: {
    type: String,
    default: null
  },
  imageMetadata: {
    alt: String,
    source: String,
    caption: String
  },
  wordCount: {
    type: Number,
    default: 0
  },
  estimatedReadTime: {
    type: Number,
    default: 1
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  sourceArticles: [{
    title: String,
    url: String,
    source: String,
    publishedAt: Date,
    image: String,
    imageAlt: String
  }],
  metaData: {
    metaDescription: String,
    socialTitle: String,
    keywords: [String]
  },
  generationInfo: {
    model: {
      type: String,
      default: 'gemini-pro'
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    articlesUsed: Number,
    topic: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  next();
});

// Update word count and read time
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.wordCount = this.content.trim().split(/\s+/).length;
    this.estimatedReadTime = Math.ceil(this.wordCount / 200);
  }
  next();
});

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for short excerpt
blogSchema.virtual('shortExcerpt').get(function() {
  return this.excerpt.length > 150 
    ? this.excerpt.substring(0, 150) + '...'
    : this.excerpt;
});

// Static methods
blogSchema.statics.findPublished = function() {
  return this.find({ status: 'published' }).sort({ createdAt: -1 });
};

blogSchema.statics.findByTag = function(tag) {
  return this.find({ 
    tags: { $in: [tag.toLowerCase()] },
    status: 'published'
  }).sort({ createdAt: -1 });
};

blogSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category: category.toLowerCase(),
    status: 'published'
  }).sort({ createdAt: -1 });
};

blogSchema.statics.searchBlogs = function(query) {
  return this.find({
    $and: [
      { status: 'published' },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { excerpt: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ createdAt: -1 });
};

blogSchema.statics.getPopularBlogs = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ viewCount: -1, likes: -1 })
    .limit(limit);
};

blogSchema.statics.getRecentBlogs = function(days = 7, limit = 10) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    status: 'published',
    createdAt: { $gte: dateThreshold }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Instance methods
blogSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

blogSchema.methods.addLike = function() {
  this.likes += 1;
  return this.save();
};

blogSchema.methods.getRelatedBlogs = function(limit = 5) {
  return this.constructor.find({
    _id: { $ne: this._id },
    status: 'published',
    $or: [
      { tags: { $in: this.tags } },
      { category: this.category }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Indexes for better performance
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
blogSchema.index({ viewCount: -1 });
blogSchema.index({ createdAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;