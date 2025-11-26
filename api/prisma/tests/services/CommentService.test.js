const CommentService = require('../../src/services/CommentService');
const CommentModel = require('../../src/models/Comment');
const PostModel = require('../../src/models/Post');

// Mock dependencies
jest.mock('../../src/models/Comment');
jest.mock('../../src/models/Post');

describe('CommentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create comment on published post', async () => {
      const commentData = {
        name: 'John Doe',
        email: 'john@example.com',
        content: 'Great post!'
      };

      const mockPost = {
        id: 1,
        published: true
      };

      const mockComment = {
        id: 1,
        ...commentData,
        postId: 1
      };

      PostModel.findById.mockResolvedValue(mockPost);
      CommentModel.create.mockResolvedValue(mockComment);

      const result = await CommentService.createComment(1, commentData);

      expect(PostModel.findById).toHaveBeenCalledWith(1);
      expect(CommentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Great post!',
          postId: 1,
          published: true
        })
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw error if post not found', async () => {
      PostModel.findById.mockResolvedValue(null);

      await expect(CommentService.createComment(999, { content: 'Test' })).rejects.toThrow('Post not found');
    });

    it('should throw error if post is unpublished', async () => {
      const mockPost = {
        id: 1,
        published: false
      };

      PostModel.findById.mockResolvedValue(mockPost);

      await expect(CommentService.createComment(1, { content: 'Test' })).rejects.toThrow('Cannot comment on unpublished posts');
    });
  });

  describe('getComments', () => {
    it('should get all comments with filters', async () => {
      const mockComments = [{ id: 1, content: 'Comment 1' }];
      CommentModel.findAll.mockResolvedValue(mockComments);

      const result = await CommentService.getComments({ postId: 1, published: true });

      expect(CommentModel.findAll).toHaveBeenCalledWith(
        { postId: 1, published: true },
        expect.any(Object)
      );
      expect(result).toEqual(mockComments);
    });
  });

  describe('getCommentsByPostId', () => {
    it('should get published comments for a post', async () => {
      const mockComments = [{ id: 1, content: 'Comment 1' }];
      CommentModel.findByPostId.mockResolvedValue(mockComments);

      const result = await CommentService.getCommentsByPostId(1);

      expect(CommentModel.findByPostId).toHaveBeenCalledWith(
        1,
        { published: true },
        expect.objectContaining({
          orderBy: { createdAt: 'asc' }
        })
      );
      expect(result).toEqual(mockComments);
    });
  });

  describe('updateComment', () => {
    it('should update comment for authorized user', async () => {
      const mockComment = {
        id: 1,
        post: { authorId: 1 }
      };

      const updateData = {
        content: 'Updated comment',
        published: false
      };

      CommentModel.findById.mockResolvedValue(mockComment);
      CommentModel.update.mockResolvedValue({ id: 1, ...updateData });

      const result = await CommentService.updateComment(1, updateData, 1, 'AUTHOR');

      expect(CommentModel.update).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw error for unauthorized update', async () => {
      const mockComment = {
        id: 1,
        post: { authorId: 2 }
      };

      CommentModel.findById.mockResolvedValue(mockComment);

      await expect(CommentService.updateComment(1, {}, 1, 'AUTHOR')).rejects.toThrow('Forbidden');
    });
  });

  describe('deleteComment', () => {
    it('should delete comment for authorized user', async () => {
      const mockComment = {
        id: 1,
        post: { authorId: 1 }
      };

      CommentModel.findById.mockResolvedValue(mockComment);
      CommentModel.delete.mockResolvedValue();

      const result = await CommentService.deleteComment(1, 1, 'AUTHOR');

      expect(CommentModel.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ ok: true, message: 'Comment deleted successfully' });
    });
  });
});

