import mongoose from 'mongoose';
import UserModel from '../models/User.js';

class UserDAO {
  isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async findAll(filter = {}) {
    return await UserModel.find(filter).select('-password').lean();
  }

  async findById(id) {
    return await UserModel.findById(id).select('-password').lean();
  }

  async findOne(filter) {
    return await UserModel.findOne(filter).lean();
  }

  async create(userData) {
    return await UserModel.create(userData);
  }

  async update(id, updateData) {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
      .select('-password')
      .lean();
  }

  async count(filter = {}) {
    return await UserModel.countDocuments(filter);
  }
}

export const usersDAO = new UserDAO();
export default usersDAO;
