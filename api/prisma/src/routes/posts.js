const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const PostService = require('../services/PostService');
const PostValidator = require('../validators/postValidator');

// Public list
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const publishedOnly = !req.headers.authorization || req.query.published !== 'false';
    
    const result = await PostService.getPosts(page, limit, publishedOnly);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get by ID (protected)
router.get('/id/:id', authenticate, async (req, res, next) => {
  try {
    const id = PostValidator.validateId(req.params.id);
    const post = await PostService.getPostById(id, req.user.id, req.user.role);
    res.json(post);
  } catch (err) {
    if (err.message === 'Post not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Forbidden') {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
});

// Get by slug (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await PostService.getPostBySlug(req.params.slug);
    res.json(post);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Create (protected)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const data = PostValidator.validateCreate(req.body);
    const post = await PostService.createPost(data, req.user.id);
    res.status(201).json(post);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update (protected)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = PostValidator.validateId(req.params.id);
    const data = PostValidator.validateUpdate(req.body);
    const post = await PostService.updatePost(id, data, req.user.id, req.user.role);
    res.json(post);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    if (err.message === 'Post not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Forbidden') {
      return res.status(403).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

// Delete (protected)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const id = PostValidator.validateId(req.params.id);
    const result = await PostService.deletePost(id, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    if (err.message === 'Post not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Forbidden') {
      return res.status(403).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
