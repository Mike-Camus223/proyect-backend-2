import UserModel from '../models/User.js';

class UsersDAO {
  async getAll() {
    return await UserModel.find().select('-password').lean();
  }

  async getById(id) {
    return await UserModel.findById(id).select('-password').lean();
  }

  async getByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  }

  async create(userData) {
    return await UserModel.create(userData);
  }

  async updateRole(id, role) {
    return await UserModel.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();
  }
}

export const usersDAO = new UsersDAO();
export default usersDAO;
