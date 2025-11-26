const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const CommentService = require('../services/CommentService');
const CommentValidator = require('../validators/commentValidator');

// Create comment (public)
router.post('/:postId', async (req, res, next) => {
  try {
    const postId = CommentValidator.validatePostId(req.params.postId);
    const comment = await CommentService.createComment(postId, req.body);
    res.status(201).json(comment);
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (err.message === 'Post not found' || err.message === 'Cannot comment on unpublished posts') {
      const status = err.message === 'Post not found' ? 404 : 403;
      return res.status(status).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

// Admin: List all comments (protected)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const filters = {
      postId: req.query.postId ? Number(req.query.postId) : undefined,
      published: req.query.published !== undefined ? req.query.published === 'true' : undefined
    };
    const comments = await CommentService.getComments(filters);
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// Get comments for a specific post (public)
router.get('/post/:postId', async (req, res, next) => {
  try {
    const postId = CommentValidator.validatePostId(req.params.postId);
    const comments = await CommentService.getCommentsByPostId(postId);
    res.json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single comment by ID (protected)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const id = CommentValidator.validateId(req.params.id);
    const comment = await CommentService.getCommentById(id);
    res.json(comment);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Update comment (protected)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = CommentValidator.validateId(req.params.id);
    const comment = await CommentService.updateComment(id, req.body, req.user.id, req.user.role);
    res.json(comment);
  } catch (err) {
    if (err.message === 'Comment not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Forbidden') {
      return res.status(403).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

// Delete comment (protected)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const id = CommentValidator.validateId(req.params.id);
    const result = await CommentService.deleteComment(id, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    if (err.message === 'Comment not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Forbidden') {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
