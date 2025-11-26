// Create test app instance
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('test'));

// Routers
const authRouter = require('../../src/routes/auth');
const postsRouter = require('../../src/routes/posts');
const commentsRouter = require('../../src/routes/comments');
const usersRouter = require('../../src/routes/users');

app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/users', usersRouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;

