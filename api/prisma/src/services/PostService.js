const PostModel = require('../models/Post');
const { slugify } = require('../utils/slugify');

class PostService {
  async getPosts(page = 1, limit = 10, publishedOnly = true) {
    const skip = (page - 1) * limit;
    const where = publishedOnly ? { published: true } : {};
    
    const [posts, total] = await Promise.all([
      PostModel.findAll(where, {
        include: { 
          author: { select: { id: true, username: true, email: true } },
          _count: { select: { comments: true } }
        },
        skip,
        take: limit
      }),
      PostModel.count(where)
    ]);
    
    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getPostById(id, userId, userRole) {
    const post = await PostModel.findById(id, {
      author: { select: { id: true, username: true, email: true } },
      comments: { orderBy: { createdAt: 'asc' } }
    });
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Authorization check
    if (!post.published && post.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Forbidden');
    }
    
    return post;
  }

  async getPostBySlug(slug) {
    const post = await PostModel.findBySlug(slug, {
      comments: { 
        where: { published: true }, 
        orderBy: { createdAt: 'asc' } 
      },
      author: { select: { id: true, username: true } }
    });
    
    if (!post || !post.published) {
      throw new Error('Post not found');
    }
    
    return post;
  }

  async createPost(data, authorId) {
    const baseSlug = slugify(data.title);
    if (!baseSlug) {
      throw new Error('Title must contain valid characters');
    }
    
    const slug = await PostModel.findUniqueSlug(baseSlug);
    
    return PostModel.create({
      title: data.title.trim(),
      content: data.content.trim(),
      slug,
      published: Boolean(data.published),
      publishedAt: data.published ? new Date() : null,
      authorId
    });
  }

  async updatePost(id, data, userId, userRole) {
    const post = await PostModel.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Authorization
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Forbidden');
    }
    
    const update = {};
    
    if (data.title !== undefined) {
      update.title = data.title.trim();
      const newSlug = slugify(data.title);
      if (newSlug && newSlug !== post.slug) {
        update.slug = await PostModel.findUniqueSlug(newSlug);
      }
    }
    
    if (data.content !== undefined) {
      update.content = data.content.trim();
    }
    
    if (typeof data.published === 'boolean') {
      update.published = data.published;
      if (data.published && !post.publishedAt) {
        update.publishedAt = new Date();
      }
    }
    
    return PostModel.update(id, update);
  }

  async deletePost(id, userId, userRole) {
    const post = await PostModel.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Forbidden');
    }
    
    await PostModel.delete(id);
    return { ok: true, message: 'Post deleted successfully' };
  }
}

module.exports = new PostService();

