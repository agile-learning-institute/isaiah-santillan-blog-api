const UserModel = require('../models/User');

class UserService {
  async getAllUsers() {
    return UserModel.findAll();
  }
}

module.exports = new UserService();

