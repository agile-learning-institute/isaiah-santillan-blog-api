const request = require('supertest');
const app = require('../helpers/testApp');
const CommentService = require('../../src/services/CommentService');

// Mock services
jest.mock('../../src/services/CommentService');

describe('Comments Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /comments/:postId', () => {
    it('should create a comment on published post', async () => {
      const commentData = {
        name: 'John Doe',
        email: 'john@example.com',
        content: 'Great post!'
      };

      const mockComment = {
        id: 1,
        ...commentData,
        postId: 1
      };

      CommentService.createComment.mockResolvedValue(mockComment);

      const response = await request(app)
        .post('/comments/1')
        .send(commentData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockComment);
      expect(CommentService.createComment).toHaveBeenCalledWith(1, commentData);
    });

    it('should return 400 for validation errors', async () => {
      CommentService.createComment.mockRejectedValue(new Error('Comment content is required'));

      const response = await request(app)
        .post('/comments/1')
        .send({
          name: 'John Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent post', async () => {
      const error = new Error('Post not found');
      error.code = 'P2003';
      CommentService.createComment.mockRejectedValue(error);

      const response = await request(app)
        .post('/comments/999')
        .send({
          content: 'Test comment'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /comments/post/:postId', () => {
    it('should get published comments for a post', async () => {
      const mockComments = [
        { id: 1, content: 'Comment 1', name: 'John' },
        { id: 2, content: 'Comment 2', name: 'Jane' }
      ];

      CommentService.getCommentsByPostId.mockResolvedValue(mockComments);

      const response = await request(app)
        .get('/comments/post/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComments);
      expect(CommentService.getCommentsByPostId).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /comments', () => {
    it('should get all comments for authenticated admin', async () => {
      const mockComments = [{ id: 1, content: 'Comment 1' }];
      CommentService.getComments.mockResolvedValue(mockComments);

      const response = await request(app)
        .get('/comments')
        .set('Authorization', 'Bearer mock_token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComments);
    });
  });
});

