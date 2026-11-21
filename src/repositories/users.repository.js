import usersDAO from '../dao/users.dao.js';

class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  isValidId(id) {
    return this.dao.isValidId(id);
  }

  async findAllUsers() {
    return await this.dao.findAll();
  }

  async findUserById(id) {
    return await this.dao.findById(id);
  }

  async findByEmail(email) {
    return await this.dao.findOne({ email });
  }

  async createUser(userData) {
    return await this.dao.create(userData);
  }

  async updateUserRole(id, role) {
    return await this.dao.update(id, { role });
  }

  async getUsers() {
    return this.findAllUsers();
  }

  async getUserById(id) {
    return this.findUserById(id);
  }

  async getUserByEmail(email) {
    return this.findByEmail(email);
  }
}

export const usersRepository = new UserRepository(usersDAO);
export default usersRepository;
