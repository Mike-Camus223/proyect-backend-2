import mongoose from 'mongoose';
import usersRepository from '../repositories/users.repository.js';

const VALID_ROLES = ['user', 'organizer', 'admin'];

const formatUser = (user) => ({
  id: (user._id || user.id).toString(),
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role
});

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class UsersService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllUsers() {
    const users = await this.repository.getUsers();
    return users.map(formatUser);
  }

  async getUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError('ID de usuario inválido', 400);
    }

    const user = await this.repository.getUserById(id);
    if (!user) {
      throw createHttpError('Usuario no encontrado', 404);
    }

    return formatUser(user);
  }

  async updateUserRole(id, role) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError('ID de usuario inválido', 400);
    }

    if (!role || !VALID_ROLES.includes(role)) {
      throw createHttpError('Rol inválido. Valores permitidos: user, organizer, admin', 400);
    }

    const updated = await this.repository.updateUserRole(id, role);
    if (!updated) {
      throw createHttpError('Usuario no encontrado', 404);
    }

    return formatUser(updated);
  }
}

export const usersService = new UsersService(usersRepository);
export default usersService;
