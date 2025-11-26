const bcrypt = require('bcrypt');
const UserModel = require('../models/User');
const { signToken } = require('../utils/jwt');
const AuthValidator = require('../validators/authValidator');

class AuthService {
  async register(data) {
    const validated = AuthValidator.validateRegister(data);
    
    // Check if user exists
    const existing = await UserModel.findByEmail(validated.email);
    if (existing) {
      throw new Error('Email already in use');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12);
    
    // Create user
    const user = await UserModel.create({
      email: validated.email,
      username: validated.username,
      password: passwordHash
    });
    
    // Generate token
    const token = signToken({ id: user.id, role: user.role });
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
  }

  async login(data) {
    const validated = AuthValidator.validateLogin(data);
    
    // Find user
    const user = await UserModel.findByEmail(validated.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const ok = await bcrypt.compare(validated.password, user.password);
    if (!ok) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = signToken({ id: user.id, role: user.role });
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
  }
}

module.exports = new AuthService();

