const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');

// Register
router.post('/register', async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;


