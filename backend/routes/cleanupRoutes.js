const express = require('express');
const BlogCleanupManager = require('../BlogCleanupManager.js'); // Adjust the path as necessary

const router = express.Router();

// Delete blog by ID
router.delete('/:id', async (req, res) => {
  try {
    const cleanup = new BlogCleanupManager();
    const success = await cleanup.deleteBlogById(req.params.id);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Blog deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete blog' 
    });
  }
});

// Delete old blogs (admin route)
router.post('/cleanup/old', async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const cleanup = new BlogCleanupManager();
    
    const deletedCount = await cleanup.deleteOldBlogs(daysOld);
    
    res.json({ 
      success: true, 
      message: `Deleted ${deletedCount} old blogs`,
      deletedCount 
    });
  } catch (error) {
    console.error('Cleanup old blogs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cleanup old blogs' 
    });
  }
});

// Keep only latest N blogs (admin route)
router.post('/cleanup/keep-latest', async (req, res) => {
  try {
    const { keepCount = 10 } = req.body;
    const cleanup = new BlogCleanupManager();
    
    const deletedCount = await cleanup.keepLatestBlogs(keepCount);
    
    res.json({ 
      success: true, 
      message: `Kept latest ${keepCount} blogs, deleted ${deletedCount} old blogs`,
      deletedCount 
    });
  } catch (error) {
    console.error('Keep latest blogs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cleanup blogs' 
    });
  }
});

// Delete blogs by category (admin route)
router.delete('/category/:category', async (req, res) => {
  try {
    const cleanup = new BlogCleanupManager();
    const deletedCount = await cleanup.deleteBlogsByCategory(req.params.category);
    
    res.json({ 
      success: true, 
      message: `Deleted ${deletedCount} blogs from ${req.params.category} category`,
      deletedCount 
    });
  } catch (error) {
    console.error('Delete by category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete blogs by category' 
    });
  }
});

// Get cleanup preview (what would be deleted)
router.get('/cleanup/preview/:daysOld', async (req, res) => {
  try {
    const daysOld = parseInt(req.params.daysOld) || 30;
    const cleanup = new BlogCleanupManager();
    
    const blogs = await cleanup.listBlogsToDelete(daysOld);
    
    res.json({ 
      success: true, 
      blogs: blogs,
      count: blogs.length,
      message: `Found ${blogs.length} blogs older than ${daysOld} days`
    });
  } catch (error) {
    console.error('Cleanup preview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get cleanup preview' 
    });
  }
});

// Get database statistics
router.get('/stats', async (req, res) => {
  try {
    const cleanup = new BlogCleanupManager();
    const stats = await cleanup.getStats();
    
    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get database statistics' 
    });
  }
});

module.exports = router;
