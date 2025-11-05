const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const prisma = new PrismaClient();

// create comment (public)
router.post('/:postId', async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);
    const { name, email, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing content' });
    const comment = await prisma.comment.create({
      data: { name, email, content, postId, published: true }
    });
    res.status(201).json(comment);
  } catch (err) { next(err); }
});

// admin: list, delete, moderate - protect these
router.get('/', authenticate, async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({ orderBy: { createdAt: 'desc' }});
    res.json(comments);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.comment.delete({ where: { id }});
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { content, published } = req.body;
    const updated = await prisma.comment.update({
      where: { id },
      data: { content, published }
    });
    res.json(updated);
  } catch (err) { next(err); }
});

module.exports = router;
