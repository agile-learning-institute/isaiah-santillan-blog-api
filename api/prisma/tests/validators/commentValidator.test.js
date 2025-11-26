const CommentValidator = require('../../src/validators/commentValidator');

describe('CommentValidator', () => {
  describe('validateCreate', () => {
    it('should validate correct comment data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        content: 'This is a comment'
      };
      
      const result = CommentValidator.validateCreate(data);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.content).toBe('This is a comment');
    });

    it('should allow optional name and email', () => {
      const data = {
        content: 'This is a comment'
      };
      
      const result = CommentValidator.validateCreate(data);
      expect(result.name).toBeNull();
      expect(result.email).toBeNull();
      expect(result.content).toBe('This is a comment');
    });

    it('should trim all fields', () => {
      const data = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        content: '  This is a comment  '
      };
      
      const result = CommentValidator.validateCreate(data);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.content).toBe('This is a comment');
    });

    it('should throw error if content is missing', () => {
      const data = {
        name: 'John Doe'
      };
      
      expect(() => CommentValidator.validateCreate(data)).toThrow('Comment content is required');
    });

    it('should throw error if email format is invalid', () => {
      const data = {
        email: 'invalid-email',
        content: 'This is a comment'
      };
      
      expect(() => CommentValidator.validateCreate(data)).toThrow('Invalid email format');
    });
  });

  describe('validateUpdate', () => {
    it('should validate update data', () => {
      const data = {
        content: 'Updated comment',
        published: false
      };
      
      const result = CommentValidator.validateUpdate(data);
      expect(result.content).toBe('Updated comment');
      expect(result.published).toBe(false);
    });

    it('should throw error if content is empty', () => {
      const data = {
        content: '   '
      };
      
      expect(() => CommentValidator.validateUpdate(data)).toThrow('Content cannot be empty');
    });

    it('should throw error if email format is invalid', () => {
      const data = {
        email: 'invalid-email'
      };
      
      expect(() => CommentValidator.validateUpdate(data)).toThrow('Invalid email format');
    });
  });

  describe('validateId', () => {
    it('should validate numeric ID', () => {
      const id = CommentValidator.validateId('123');
      expect(id).toBe(123);
    });

    it('should throw error for non-numeric ID', () => {
      expect(() => CommentValidator.validateId('abc')).toThrow('Invalid comment ID');
    });
  });

  describe('validatePostId', () => {
    it('should validate numeric post ID', () => {
      const id = CommentValidator.validatePostId('456');
      expect(id).toBe(456);
    });

    it('should throw error for non-numeric post ID', () => {
      expect(() => CommentValidator.validatePostId('abc')).toThrow('Invalid post ID');
    });
  });
});

