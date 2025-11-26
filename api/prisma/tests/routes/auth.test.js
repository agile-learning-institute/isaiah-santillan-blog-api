const request = require('supertest');
const app = require('../helpers/testApp');
const AuthService = require('../../src/services/AuthService');

// Mock AuthService
jest.mock('../../src/services/AuthService');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const mockResponse = {
        token: 'mock_token',
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          role: 'AUTHOR'
        }
      };

      AuthService.register.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResponse);
      expect(AuthService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });
    });

    it('should return 400 for validation errors', async () => {
      AuthService.register.mockRejectedValue(new Error('Email is required'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 for duplicate email', async () => {
      const error = new Error('Email already in use');
      error.code = 'P2002';
      AuthService.register.mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already in use');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      const mockResponse = {
        token: 'mock_token',
        user: {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          role: 'AUTHOR'
        }
      };

      AuthService.login.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(AuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should return 401 for invalid credentials', async () => {
      AuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});

