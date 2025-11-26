const PostValidator = require('../../src/validators/postValidator');

describe('PostValidator', () => {
  describe('validateCreate', () => {
    it('should validate correct post data', () => {
      const data = {
        title: 'Test Post',
        content: 'This is test content',
        published: true
      };
      
      const result = PostValidator.validateCreate(data);
      
      expect(result.title).toBe('Test Post');
      expect(result.content).toBe('This is test content');
      expect(result.published).toBe(true);
    });

    it('should trim title and content', () => {
      const data = {
        title: '  Test Post  ',
        content: '  This is test content  '
      };
      
      const result = PostValidator.validateCreate(data);
      expect(result.title).toBe('Test Post');
      expect(result.content).toBe('This is test content');
    });

    it('should convert published to boolean', () => {
      const data = {
        title: 'Test Post',
        content: 'Content',
        published: 'true'
      };
      
      const result = PostValidator.validateCreate(data);
      expect(result.published).toBe(true);
    });

    it('should throw error if title is missing', () => {
      const data = {
        content: 'This is test content'
      };
      
      expect(() => PostValidator.validateCreate(data)).toThrow('Title is required');
    });

    it('should throw error if title is empty', () => {
      const data = {
        title: '   ',
        content: 'This is test content'
      };
      
      expect(() => PostValidator.validateCreate(data)).toThrow('Title is required');
    });

    it('should throw error if content is missing', () => {
      const data = {
        title: 'Test Post'
      };
      
      expect(() => PostValidator.validateCreate(data)).toThrow('Content is required');
    });
  });

  describe('validateUpdate', () => {
    it('should validate partial update data', () => {
      const data = {
        title: 'Updated Title'
      };
      
      const result = PostValidator.validateUpdate(data);
      expect(result.title).toBe('Updated Title');
    });

    it('should throw error if title is empty string', () => {
      const data = {
        title: '   '
      };
      
      expect(() => PostValidator.validateUpdate(data)).toThrow('Title cannot be empty');
    });

    it('should throw error if content is empty string', () => {
      const data = {
        content: '   '
      };
      
      expect(() => PostValidator.validateUpdate(data)).toThrow('Content cannot be empty');
    });

    it('should allow undefined fields', () => {
      const data = {
        published: true
      };
      
      const result = PostValidator.validateUpdate(data);
      expect(result.published).toBe(true);
    });
  });

  describe('validateId', () => {
    it('should validate numeric ID', () => {
      const id = PostValidator.validateId('123');
      expect(id).toBe(123);
    });

    it('should throw error for non-numeric ID', () => {
      expect(() => PostValidator.validateId('abc')).toThrow('Invalid post ID');
    });

    it('should throw error for NaN', () => {
      expect(() => PostValidator.validateId('not-a-number')).toThrow('Invalid post ID');
    });
  });
});

