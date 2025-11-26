class AuthValidator {
  validateRegister(data) {
    const errors = [];
    
    if (!data.email || !data.email.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push('Invalid email format');
      }
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return {
      email: data.email.trim().toLowerCase(),
      username: data.username?.trim() || null,
      password: data.password
    };
  }

  validateLogin(data) {
    const errors = [];
    
    if (!data.email || !data.email.trim()) {
      errors.push('Email is required');
    }
    
    if (!data.password) {
      errors.push('Password is required');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return {
      email: data.email.trim().toLowerCase(),
      password: data.password
    };
  }
}

module.exports = new AuthValidator();

