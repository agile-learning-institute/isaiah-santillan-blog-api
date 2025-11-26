const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommentModel {
  async findAll(where = {}, options = {}) {
    return prisma.comment.findMany({
      where,
      include: options.include,
      orderBy: options.orderBy || { createdAt: 'desc' }
    });
  }

  async findById(id, include = {}) {
    return prisma.comment.findUnique({
      where: { id },
      include
    });
  }

  async findByPostId(postId, where = {}, options = {}) {
    return prisma.comment.findMany({
      where: { postId, ...where },
      ...options
    });
  }

  async create(data) {
    return prisma.comment.create({
      data,
      include: { post: { select: { id: true, title: true, slug: true } } }
    });
  }

  async update(id, data) {
    return prisma.comment.update({
      where: { id },
      data,
      include: { post: { select: { id: true, title: true, slug: true } } }
    });
  }

  async delete(id) {
    return prisma.comment.delete({ where: { id } });
  }
}

module.exports = new CommentModel();

