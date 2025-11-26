class CommentValidator {
  validateCreate(data) {
    const errors = [];
    
    if (!data.content || !data.content.trim()) {
      errors.push('Comment content is required');
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return {
      name: data.name?.trim() || null,
      email: data.email?.trim() || null,
      content: data.content.trim()
    };
  }

  validateUpdate(data) {
    const errors = [];
    
    if (data.content !== undefined && !data.content.trim()) {
      errors.push('Content cannot be empty');
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return data;
  }

  validateId(id) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new Error('Invalid comment ID');
    }
    return numId;
  }

  validatePostId(postId) {
    const numId = Number(postId);
    if (isNaN(numId)) {
      throw new Error('Invalid post ID');
    }
    return numId;
  }
}

module.exports = new CommentValidator();

