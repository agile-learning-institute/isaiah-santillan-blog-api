// Mock data for testing

const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJ5q5q5q5', // hashed 'password123'
  role: 'AUTHOR',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockPost = {
  id: 1,
  title: 'Test Post',
  slug: 'test-post',
  content: 'This is a test post content',
  published: true,
  publishedAt: new Date(),
  authorId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  }
};

const mockComment = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  content: 'This is a test comment',
  postId: 1,
  published: true,
  createdAt: new Date(),
  post: {
    id: 1,
    title: 'Test Post',
    slug: 'test-post'
  }
};

module.exports = {
  mockUser,
  mockPost,
  mockComment
};

