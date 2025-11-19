const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// Improved slugify function that handles edge cases and collisions
const slugify = (s) => {
  if (!s) return '';
  return s.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate unique slug by checking for existing slugs
async function generateUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Public list (with pagination and filtering)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    
    // Only show published posts to public, authenticated authors/admins can see all
    const isAuthenticated = req.headers.authorization;
    const publishedOnly = !isAuthenticated || req.query.published !== 'false';
    
    const where = publishedOnly ? { published: true } : {};
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { 
          author: { select: { id: true, username: true, email: true } },
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);
    
    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) { next(err); }
});

// Get post by ID (for admin panel - protected)
router.get('/id/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid post ID' });
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: { 
        author: { select: { id: true, username: true, email: true } },
        comments: { orderBy: { createdAt: 'asc' } }
      }
    });
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Only author or admin can see unpublished posts
    if (!post.published && post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(post);
  } catch (err) { next(err); }
});

// Public single post by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: { 
        comments: { 
          where: { published: true }, 
          orderBy: { createdAt: 'asc' } 
        }, 
        author: { select: { id: true, username: true } }
      }
    });
    
    if (!post || !post.published) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) { next(err); }
});

// Protected create (requires authentication)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, content, published = false } = req.body;
    
    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Generate unique slug
    const baseSlug = slugify(title);
    if (!baseSlug) {
      return res.status(400).json({ error: 'Title must contain valid characters' });
    }
    const slug = await generateUniqueSlug(baseSlug);
    
    const data = {
      title: title.trim(),
      content: content.trim(),
      slug,
      published: Boolean(published),
      publishedAt: published ? new Date() : null,
      authorId: req.user.id
    };
    
    const post = await prisma.post.create({ 
      data,
      include: { author: { select: { id: true, username: true, email: true } } }
    });
    
    res.status(201).json(post);
  } catch (err) { 
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    next(err); 
  }
});

// Update post (protected - author or admin only)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid post ID' });
    
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Only author or admin can update
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { title, content, published } = req.body;
    
    // Build update object
    const update = {};
    
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      update.title = title.trim();
      
      // Update slug if title changed
      const newSlug = slugify(title);
      if (newSlug && newSlug !== post.slug) {
        update.slug = await generateUniqueSlug(newSlug);
      }
    }
    
    if (content !== undefined) {
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }
      update.content = content.trim();
    }
    
    // Handle published status and publishedAt
    if (typeof published === 'boolean') {
      update.published = published;
      // Set publishedAt when publishing for the first time
      if (published && !post.publishedAt) {
        update.publishedAt = new Date();
      }
      // Don't clear publishedAt when unpublishing (preserve original publish date)
    }
    
    const updated = await prisma.post.update({ 
      where: { id }, 
      data: update,
      include: { author: { select: { id: true, username: true, email: true } } }
    });
    
    res.json(updated);
  } catch (err) { 
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    next(err); 
  }
});

// Delete post (protected - author or admin only)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid post ID' });
    
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Only author or admin can delete
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await prisma.post.delete({ where: { id } });
    res.json({ ok: true, message: 'Post deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
