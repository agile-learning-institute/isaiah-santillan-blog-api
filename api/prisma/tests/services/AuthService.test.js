const AuthService = require('../../src/services/AuthService');
const UserModel = require('../../src/models/User');
const { signToken } = require('../../src/utils/jwt');
const bcrypt = require('bcrypt');

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('../../src/utils/jwt');
jest.mock('bcrypt');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      };

      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: 'AUTHOR',
        password: hashedPassword
      };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      UserModel.findByEmail.mockResolvedValue(null);
      UserModel.create.mockResolvedValue(mockUser);
      signToken.mockReturnValue('mock_token');

      const result = await AuthService.register(userData);

      expect(UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(UserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword
      });
      expect(signToken).toHaveBeenCalledWith({ id: 1, role: 'AUTHOR' });
      expect(result).toEqual({
        token: 'mock_token',
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          role: 'AUTHOR'
        }
      });
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      UserModel.findByEmail.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await expect(AuthService.register(userData)).rejects.toThrow('Email already in use');
      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: 'AUTHOR',
        password: 'hashed_password'
      };

      UserModel.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      signToken.mockReturnValue('mock_token');

      const result = await AuthService.login(loginData);

      expect(UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(signToken).toHaveBeenCalledWith({ id: 1, role: 'AUTHOR' });
      expect(result).toEqual({
        token: 'mock_token',
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          role: 'AUTHOR'
        }
      });
    });

    it('should throw error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      UserModel.findByEmail.mockResolvedValue(null);

      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password'
      };

      UserModel.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });
});

