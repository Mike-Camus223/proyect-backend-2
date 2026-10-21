import usersRepository from '../repositories/users.repository.js';

class SessionsService {
  constructor(repository) {
    this.repository = repository;
  }

  async registerUser(userData) {
    return { registered: true };
  }

  async authenticateUser(credentials) {
    return { token: null };
  }
}

export const sessionsService = new SessionsService(usersRepository);
export default sessionsService;
