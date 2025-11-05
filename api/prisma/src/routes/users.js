const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, username: true, role: true }});
  res.json(users);
});

module.exports = router;
