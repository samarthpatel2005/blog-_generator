const Blog = require('./models/Blog');

class BlogCleanupManager {
  constructor() {
    this.name = 'BlogCleanupManager';
  }

  /**
   * Delete a blog by its ID
   * @param {string} blogId - The ID of the blog to delete
   * @returns {boolean} - Success status
   */
  async deleteBlogById(blogId) {
    try {
      const result = await Blog.findByIdAndDelete(blogId);
      
      if (result) {
        console.log(`✅ Deleted blog: ${result.title} (${blogId})`);
        return true;
      } else {
        console.log(`❌ Blog not found: ${blogId}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error deleting blog ${blogId}:`, error);
      throw error;
    }
  }

  /**
   * Delete blogs older than specified days
   * @param {number} daysOld - Number of days old
   * @returns {number} - Number of deleted blogs
   */
  async deleteOldBlogs(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Blog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      console.log(`✅ Deleted ${result.deletedCount} blogs older than ${daysOld} days`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error deleting old blogs:', error);
      throw error;
    }
  }

  /**
   * Delete blogs by category
   * @param {string} category - The category to delete
   * @returns {number} - Number of deleted blogs
   */
  async deleteBlogsByCategory(category) {
    try {
      const result = await Blog.deleteMany({
        category: category
      });

      console.log(`✅ Deleted ${result.deletedCount} blogs from category: ${category}`);
      return result.deletedCount;
    } catch (error) {
      console.error(`❌ Error deleting blogs from category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Delete duplicate blogs based on title
   * @returns {number} - Number of deleted duplicates
   */
  async deleteDuplicateBlogs() {
    try {
      const duplicates = await Blog.aggregate([
        {
          $group: {
            _id: "$title",
            ids: { $push: "$_id" },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        }
      ]);

      let deletedCount = 0;
      
      for (const duplicate of duplicates) {
        // Keep the first one, delete the rest
        const idsToDelete = duplicate.ids.slice(1);
        const result = await Blog.deleteMany({
          _id: { $in: idsToDelete }
        });
        deletedCount += result.deletedCount;
      }

      console.log(`✅ Deleted ${deletedCount} duplicate blogs`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error deleting duplicate blogs:', error);
      throw error;
    }
  }

  /**
   * Get cleanup statistics
   * @returns {Object} - Cleanup statistics
   */
  async getCleanupStats() {
    try {
      const total = await Blog.countDocuments();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const oldBlogs = await Blog.countDocuments({
        createdAt: { $lt: oneMonthAgo }
      });

      const duplicates = await Blog.aggregate([
        {
          $group: {
            _id: "$title",
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        },
        {
          $count: "duplicateGroups"
        }
      ]);

      const duplicateCount = duplicates.length > 0 ? duplicates[0].duplicateGroups : 0;

      return {
        totalBlogs: total,
        oldBlogs: oldBlogs,
        duplicateGroups: duplicateCount,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting cleanup stats:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive cleanup
   * @param {Object} options - Cleanup options
   * @returns {Object} - Cleanup results
   */
  async performCleanup(options = {}) {
    const {
      deleteOld = false,
      daysOld = 30,
      removeDuplicates = false,
      categories = []
    } = options;

    const results = {
      oldBlogsDeleted: 0,
      duplicatesDeleted: 0,
      categoryBlogsDeleted: 0,
      totalDeleted: 0
    };

    try {
      if (deleteOld) {
        results.oldBlogsDeleted = await this.deleteOldBlogs(daysOld);
        results.totalDeleted += results.oldBlogsDeleted;
      }

      if (removeDuplicates) {
        results.duplicatesDeleted = await this.deleteDuplicateBlogs();
        results.totalDeleted += results.duplicatesDeleted;
      }

      if (categories.length > 0) {
        for (const category of categories) {
          const deleted = await this.deleteBlogsByCategory(category);
          results.categoryBlogsDeleted += deleted;
          results.totalDeleted += deleted;
        }
      }

      console.log(`✅ Cleanup completed. Total deleted: ${results.totalDeleted}`);
      return results;
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }
}

module.exports = BlogCleanupManager;