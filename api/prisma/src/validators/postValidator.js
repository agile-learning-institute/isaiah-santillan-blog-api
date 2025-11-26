class PostValidator {
  validateCreate(data) {
    const errors = [];
    
    if (!data.title || !data.title.trim()) {
      errors.push('Title is required');
    }
    if (!data.content || !data.content.trim()) {
      errors.push('Content is required');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return {
      title: data.title.trim(),
      content: data.content.trim(),
      published: Boolean(data.published)
    };
  }

  validateUpdate(data) {
    const errors = [];
    
    if (data.title !== undefined && !data.title.trim()) {
      errors.push('Title cannot be empty');
    }
    if (data.content !== undefined && !data.content.trim()) {
      errors.push('Content cannot be empty');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return data;
  }

  validateId(id) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new Error('Invalid post ID');
    }
    return numId;
  }
}

module.exports = new PostValidator();

