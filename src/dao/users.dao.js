import UserModel from '../models/User.js';

class UsersDAO {
  async getAll() {
    return await UserModel.find().lean();
  }

  async getById(id) {
    return await UserModel.findById(id).lean();
  }

  async getByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  }

  async create(userData) {
    return await UserModel.create(userData);
  }
}

export const usersDAO = new UsersDAO();
export default usersDAO;
