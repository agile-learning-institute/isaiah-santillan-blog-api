const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// Create comment (public - anyone can comment on published posts)
router.post('/:postId', async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post ID' });
    
    // Verify post exists and is published
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.published) return res.status(403).json({ error: 'Cannot comment on unpublished posts' });
    
    const { name, email, content } = req.body;
    
    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Name and email are optional, but if provided, validate format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const comment = await prisma.comment.create({
      data: { 
        name: name?.trim() || null, 
        email: email?.trim() || null, 
        content: content.trim(), 
        postId,
        published: true // Auto-publish comments (can be moderated later)
      },
      include: { post: { select: { id: true, title: true, slug: true } } }
    });
    
    res.status(201).json(comment);
  } catch (err) { 
    if (err.code === 'P2003') {
      return res.status(404).json({ error: 'Post not found' });
    }
    next(err); 
  }
});

// Admin: List all comments (protected - admin/author only)
// This must come before /:id route
router.get('/', authenticate, async (req, res, next) => {
  try {
    const postId = req.query.postId ? Number(req.query.postId) : undefined;
    const published = req.query.published !== undefined ? req.query.published === 'true' : undefined;
    
    const where = {};
    if (postId) where.postId = postId;
    if (published !== undefined) where.published = published;
    
    const comments = await prisma.comment.findMany({
      where,
      include: {
        post: { select: { id: true, title: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(comments);
  } catch (err) { next(err); }
});

// Get comments for a specific post (public - only published comments)
// Must come after / but before /:id
router.get('/post/:postId', async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post ID' });
    
    const comments = await prisma.comment.findMany({
      where: { 
        postId,
        published: true 
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true
        // Don't expose email to public
      }
    });
    
    res.json(comments);
  } catch (err) { next(err); }
});

// Get single comment by ID (protected)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid comment ID' });
    
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: { select: { id: true, title: true, slug: true } }
      }
    });
    
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    res.json(comment);
  } catch (err) { next(err); }
});

// Update comment (protected - admin/author only)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid comment ID' });
    
    const comment = await prisma.comment.findUnique({ 
      where: { id },
      include: { post: true }
    });
    
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    // Only admin or post author can moderate comments
    if (req.user.role !== 'ADMIN' && comment.post.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { content, published, name, email } = req.body;
    const update = {};
    
    if (content !== undefined) {
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }
      update.content = content.trim();
    }
    
    if (typeof published === 'boolean') {
      update.published = published;
    }
    
    if (name !== undefined) {
      update.name = name?.trim() || null;
    }
    
    if (email !== undefined) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      update.email = email?.trim() || null;
    }
    
    const updated = await prisma.comment.update({
      where: { id },
      data: update,
      include: {
        post: { select: { id: true, title: true, slug: true } }
      }
    });
    
    res.json(updated);
  } catch (err) { next(err); }
});

// Delete comment (protected - admin/author only)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid comment ID' });
    
    const comment = await prisma.comment.findUnique({ 
      where: { id },
      include: { post: true }
    });
    
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    // Only admin or post author can delete comments
    if (req.user.role !== 'ADMIN' && comment.post.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await prisma.comment.delete({ where: { id } });
    res.json({ ok: true, message: 'Comment deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
