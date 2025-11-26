const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const UserService = require('../services/UserService');

router.get('/', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
