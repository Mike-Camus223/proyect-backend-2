import usersRepository from '../repositories/users.repository.js';
import UserDTO from '../dto/user.dto.js';

const VALID_ROLES = ['user', 'organizer', 'admin'];

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
    const users = await this.repository.findAllUsers();
    return UserDTO.fromList(users);
  }

  async getUserById(id) {
    if (!this.repository.isValidId(id)) {
      throw createHttpError('ID de usuario inválido', 400);
    }

    const user = await this.repository.findUserById(id);
    if (!user) {
      throw createHttpError('Usuario no encontrado', 404);
    }

    return UserDTO.from(user);
  }

  async updateUserRole(id, role) {
    if (!this.repository.isValidId(id)) {
      throw createHttpError('ID de usuario inválido', 400);
    }

    if (!role || !VALID_ROLES.includes(role)) {
      throw createHttpError('Rol inválido. Valores permitidos: user, organizer, admin', 400);
    }

    const updated = await this.repository.updateUserRole(id, role);
    if (!updated) {
      throw createHttpError('Usuario no encontrado', 404);
    }

    return UserDTO.from(updated);
  }
}

export const usersService = new UsersService(usersRepository);
export default usersService;
