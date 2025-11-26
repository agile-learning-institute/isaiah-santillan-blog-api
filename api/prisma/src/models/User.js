const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserModel {
  async findByEmail(email) {
    return prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findAll(options = {}) {
    return prisma.user.findMany({
      select: options.select || { id: true, email: true, username: true, role: true }
    });
  }

  async create(data) {
    return prisma.user.create({ data });
  }
}

module.exports = new UserModel();

