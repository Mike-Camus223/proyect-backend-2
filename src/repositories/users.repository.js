import usersDAO from '../dao/users.dao.js';

class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getUsers() {
    return await this.dao.getAll();
  }

  async getUserById(id) {
    return await this.dao.getById(id);
  }

  async getUserByEmail(email) {
    return await this.dao.getByEmail(email);
  }

  async createUser(userData) {
    return await this.dao.create(userData);
  }

  async updateUserRole(id, role) {
    return await this.dao.updateRole(id, role);
  }
}

export const usersRepository = new UsersRepository(usersDAO);
export default usersRepository;
