const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PostModel {
  async findAll(where = {}, options = {}) {
    return prisma.post.findMany({
      where,
      include: options.include,
      orderBy: options.orderBy || { createdAt: 'desc' },
      skip: options.skip,
      take: options.take
    });
  }

  async findById(id, include = {}) {
    return prisma.post.findUnique({
      where: { id },
      include
    });
  }

  async findBySlug(slug, include = {}) {
    return prisma.post.findUnique({
      where: { slug },
      include
    });
  }

  async create(data) {
    return prisma.post.create({ 
      data,
      include: { author: { select: { id: true, username: true, email: true } } }
    });
  }

  async update(id, data) {
    return prisma.post.update({
      where: { id },
      data,
      include: { author: { select: { id: true, username: true, email: true } } }
    });
  }

  async delete(id) {
    return prisma.post.delete({ where: { id } });
  }

  async count(where = {}) {
    return prisma.post.count({ where });
  }

  async findUniqueSlug(baseSlug) {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.findBySlug(slug);
      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}

module.exports = new PostModel();

