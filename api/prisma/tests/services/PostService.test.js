const PostService = require('../../src/services/PostService');
const PostModel = require('../../src/models/Post');
const { slugify } = require('../../src/utils/slugify');

// Mock dependencies
jest.mock('../../src/models/Post');
jest.mock('../../src/utils/slugify');

describe('PostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should get published posts with pagination', async () => {
      const mockPosts = [{ id: 1, title: 'Post 1' }];
      const mockTotal = 1;

      PostModel.findAll.mockResolvedValue(mockPosts);
      PostModel.count.mockResolvedValue(mockTotal);

      const result = await PostService.getPosts(1, 10, true);

      expect(PostModel.findAll).toHaveBeenCalledWith(
        { published: true },
        expect.objectContaining({
          skip: 0,
          take: 10
        })
      );
      expect(result.posts).toEqual(mockPosts);
      expect(result.pagination.total).toBe(1);
    });

    it('should get all posts when publishedOnly is false', async () => {
      PostModel.findAll.mockResolvedValue([]);
      PostModel.count.mockResolvedValue(0);

      await PostService.getPosts(1, 10, false);

      expect(PostModel.findAll).toHaveBeenCalledWith({}, expect.any(Object));
    });
  });

  describe('getPostById', () => {
    it('should get post by ID for authorized user', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        published: true,
        authorId: 1
      };

      PostModel.findById.mockResolvedValue(mockPost);

      const result = await PostService.getPostById(1, 1, 'AUTHOR');

      expect(PostModel.findById).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result).toEqual(mockPost);
    });

    it('should throw error if post not found', async () => {
      PostModel.findById.mockResolvedValue(null);

      await expect(PostService.getPostById(999, 1, 'AUTHOR')).rejects.toThrow('Post not found');
    });

    it('should throw error for unauthorized access to unpublished post', async () => {
      const mockPost = {
        id: 1,
        published: false,
        authorId: 2
      };

      PostModel.findById.mockResolvedValue(mockPost);

      await expect(PostService.getPostById(1, 1, 'AUTHOR')).rejects.toThrow('Forbidden');
    });
  });

  describe('getPostBySlug', () => {
    it('should get published post by slug', async () => {
      const mockPost = {
        id: 1,
        slug: 'test-post',
        published: true
      };

      PostModel.findBySlug.mockResolvedValue(mockPost);

      const result = await PostService.getPostBySlug('test-post');

      expect(result).toEqual(mockPost);
    });

    it('should throw error if post not found', async () => {
      PostModel.findBySlug.mockResolvedValue(null);

      await expect(PostService.getPostBySlug('nonexistent')).rejects.toThrow('Post not found');
    });

    it('should throw error if post is unpublished', async () => {
      const mockPost = {
        id: 1,
        published: false
      };

      PostModel.findBySlug.mockResolvedValue(mockPost);

      await expect(PostService.getPostBySlug('test-post')).rejects.toThrow('Post not found');
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const postData = {
        title: 'New Post',
        content: 'Content',
        published: true
      };

      slugify.mockReturnValue('new-post');
      PostModel.findUniqueSlug.mockResolvedValue('new-post');
      PostModel.create.mockResolvedValue({
        id: 1,
        ...postData,
        slug: 'new-post'
      });

      const result = await PostService.createPost(postData, 1);

      expect(slugify).toHaveBeenCalledWith('New Post');
      expect(PostModel.findUniqueSlug).toHaveBeenCalledWith('new-post');
      expect(PostModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Post',
          content: 'Content',
          slug: 'new-post',
          authorId: 1
        })
      );
      expect(result).toHaveProperty('id');
    });

    it('should throw error if title generates invalid slug', async () => {
      const postData = {
        title: '!!!',
        content: 'Content'
      };

      slugify.mockReturnValue('');

      await expect(PostService.createPost(postData, 1)).rejects.toThrow('Title must contain valid characters');
    });
  });

  describe('updatePost', () => {
    it('should update post for authorized user', async () => {
      const existingPost = {
        id: 1,
        title: 'Old Title',
        slug: 'old-title',
        authorId: 1
      };

      const updateData = {
        title: 'New Title',
        content: 'New Content'
      };

      PostModel.findById.mockResolvedValue(existingPost);
      slugify.mockReturnValue('new-title');
      PostModel.findUniqueSlug.mockResolvedValue('new-title');
      PostModel.update.mockResolvedValue({ id: 1, ...updateData });

      const result = await PostService.updatePost(1, updateData, 1, 'AUTHOR');

      expect(PostModel.findById).toHaveBeenCalledWith(1);
      expect(PostModel.update).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw error if post not found', async () => {
      PostModel.findById.mockResolvedValue(null);

      await expect(PostService.updatePost(1, {}, 1, 'AUTHOR')).rejects.toThrow('Post not found');
    });

    it('should throw error for unauthorized update', async () => {
      const existingPost = {
        id: 1,
        authorId: 2
      };

      PostModel.findById.mockResolvedValue(existingPost);

      await expect(PostService.updatePost(1, {}, 1, 'AUTHOR')).rejects.toThrow('Forbidden');
    });
  });

  describe('deletePost', () => {
    it('should delete post for authorized user', async () => {
      const existingPost = {
        id: 1,
        authorId: 1
      };

      PostModel.findById.mockResolvedValue(existingPost);
      PostModel.delete.mockResolvedValue();

      const result = await PostService.deletePost(1, 1, 'AUTHOR');

      expect(PostModel.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ ok: true, message: 'Post deleted successfully' });
    });

    it('should throw error for unauthorized delete', async () => {
      const existingPost = {
        id: 1,
        authorId: 2
      };

      PostModel.findById.mockResolvedValue(existingPost);

      await expect(PostService.deletePost(1, 1, 'AUTHOR')).rejects.toThrow('Forbidden');
    });
  });
});

