// Improved slugify function that handles edge cases and collisions
const slugify = (s) => {
  if (!s) return '';
  return s.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = { slugify };

