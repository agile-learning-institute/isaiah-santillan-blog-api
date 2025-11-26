const { slugify } = require('../../src/utils/slugify');

describe('slugify utility', () => {
  it('should convert title to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello    World')).toBe('hello-world');
  });

  it('should handle leading/trailing spaces', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });

  it('should handle special characters and numbers', () => {
    expect(slugify('Post #1: Introduction')).toBe('post-1-introduction');
  });

  it('should remove consecutive dashes', () => {
    expect(slugify('Hello---World')).toBe('hello-world');
  });
});

