const CommentModel = require('../models/Comment');
const PostModel = require('../models/Post');
const CommentValidator = require('../validators/commentValidator');

class CommentService {
  async createComment(postId, data) {
    const validated = CommentValidator.validateCreate(data);
    
    // Verify post exists and is published
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    if (!post.published) {
      throw new Error('Cannot comment on unpublished posts');
    }
    
    return CommentModel.create({
      name: validated.name,
      email: validated.email,
      content: validated.content,
      postId,
      published: true
    });
  }

  async getComments(filters = {}) {
    const where = {};
    if (filters.postId) where.postId = filters.postId;
    if (filters.published !== undefined) where.published = filters.published;
    
    return CommentModel.findAll(where, {
      include: {
        post: { select: { id: true, title: true, slug: true } }
      }
    });
  }

  async getCommentsByPostId(postId) {
    return CommentModel.findByPostId(postId, { published: true }, {
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true
      }
    });
  }

  async getCommentById(id) {
    const comment = await CommentModel.findById(id, {
      post: { select: { id: true, title: true, slug: true } }
    });
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    return comment;
  }

  async updateComment(id, data, userId, userRole) {
    const comment = await CommentModel.findById(id, { post: true });
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    // Authorization
    if (userRole !== 'ADMIN' && comment.post.authorId !== userId) {
      throw new Error('Forbidden');
    }
    
    const validated = CommentValidator.validateUpdate(data);
    const update = {};
    
    if (validated.content !== undefined) {
      update.content = validated.content.trim();
    }
    if (typeof validated.published === 'boolean') {
      update.published = validated.published;
    }
    if (validated.name !== undefined) {
      update.name = validated.name?.trim() || null;
    }
    if (validated.email !== undefined) {
      update.email = validated.email?.trim() || null;
    }
    
    return CommentModel.update(id, update);
  }

  async deleteComment(id, userId, userRole) {
    const comment = await CommentModel.findById(id, { post: true });
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    if (userRole !== 'ADMIN' && comment.post.authorId !== userId) {
      throw new Error('Forbidden');
    }
    
    await CommentModel.delete(id);
    return { ok: true, message: 'Comment deleted successfully' };
  }
}

module.exports = new CommentService();

