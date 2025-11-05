const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();
const slugify = (s) => s.toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]+/g,'');

// public list (with option to show drafts only for authenticated authors)
router.get('/', async (req, res, next) => {
  try {
    const publishedOnly = req.query.published !== 'false'; // default true
    const where = publishedOnly ? { published: true } : {};
    const posts = await prisma.post.findMany({
      where,
      include: { author: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (err) { next(err); }
});

// public single by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: { comments: { where: { published: true }, orderBy: { createdAt: 'asc' } }, author: true }
    });
    if (!post || !post.published) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) { next(err); }
});

// protected create
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, content, published=false } = req.body;
    const slug = slugify(title) + '-' + Date.now().toString().slice(-4);
    const data = {
      title, content, slug,
      published,
      publishedAt: published ? new Date() : null,
      authorId: req.user.id
    };
    const post = await prisma.post.create({ data });
    res.status(201).json(post);
  } catch (err) { next(err); }
});

// edit
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    // only author or admin can update
    const post = await prisma.post.findUnique({ where: { id }});
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { title, content, published } = req.body;
    const update = {
      title: title ?? post.title,
      content: content ?? post.content,
      published: typeof published === 'boolean' ? published : post.published,
      publishedAt: typeof published === 'boolean' && published ? new Date() : post.publishedAt
    };
    const updated = await prisma.post.update({ where: { id }, data: update });
    res.json(updated);
  } catch (err) { next(err); }
});

// delete
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id }});
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.post.delete({ where: { id }});
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
