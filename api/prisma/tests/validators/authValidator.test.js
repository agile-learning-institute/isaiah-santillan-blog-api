const AuthValidator = require('../../src/validators/authValidator');

describe('AuthValidator', () => {
  describe('validateRegister', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      };
      
      const result = AuthValidator.validateRegister(data);
      
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
      expect(result.username).toBe('testuser');
    });

    it('should normalize email to lowercase', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };
      
      const result = AuthValidator.validateRegister(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should trim email and username', () => {
      const data = {
        email: '  test@example.com  ',
        password: 'password123',
        username: '  testuser  '
      };
      
      const result = AuthValidator.validateRegister(data);
      expect(result.email).toBe('test@example.com');
      expect(result.username).toBe('testuser');
    });

    it('should set username to null if not provided', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = AuthValidator.validateRegister(data);
      expect(result.username).toBeNull();
    });

    it('should throw error if email is missing', () => {
      const data = {
        password: 'password123'
      };
      
      expect(() => AuthValidator.validateRegister(data)).toThrow('Email is required');
    });

    it('should throw error if email is invalid format', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      expect(() => AuthValidator.validateRegister(data)).toThrow('Invalid email format');
    });

    it('should throw error if password is too short', () => {
      const data = {
        email: 'test@example.com',
        password: '12345'
      };
      
      expect(() => AuthValidator.validateRegister(data)).toThrow('Password must be at least 6 characters');
    });

    it('should throw error if password is missing', () => {
      const data = {
        email: 'test@example.com'
      };
      
      expect(() => AuthValidator.validateRegister(data)).toThrow('Password must be at least 6 characters');
    });
  });

  describe('validateLogin', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = AuthValidator.validateLogin(data);
      
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
    });

    it('should normalize email to lowercase', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };
      
      const result = AuthValidator.validateLogin(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should throw error if email is missing', () => {
      const data = {
        password: 'password123'
      };
      
      expect(() => AuthValidator.validateLogin(data)).toThrow('Email is required');
    });

    it('should throw error if password is missing', () => {
      const data = {
        email: 'test@example.com'
      };
      
      expect(() => AuthValidator.validateLogin(data)).toThrow('Password is required');
    });
  });
});

