const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { signToken } = require('../utils/jwt');

const prisma = new PrismaClient();
const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    
    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { 
        email: email.trim().toLowerCase(), 
        username: username?.trim() || null, 
        password: passwordHash 
      }
    });

    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (err) { 
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    next(err); 
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, role: user.role });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (err) { next(err); }
});

module.exports = router;


