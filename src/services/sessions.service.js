import usersRepository from '../repositories/users.repository.js';
import { createHash } from '../utils/hash.js';

class SessionsService {
  constructor(repository) {
    this.repository = repository;
  }

  async registerUser({ first_name, last_name, email, password }) {
    // validar campos obligatorios
    if (!first_name || !last_name || !email || !password) {
      const error = new Error('Faltan campos obligatorios');
      error.statusCode = 400;
      throw error;
    }

    // validar formato basico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Formato de email invalido');
      error.statusCode = 400;
      throw error;
    }

    // longitud minima password
    if (password.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }

    // normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // chequear si ya existe el usuario
    const exists = await this.repository.getUserByEmail(normalizedEmail);
    if (exists) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 409;
      throw error;
    }

    // hashear password y guardar con rol user fijo
    const hashedPassword = createHash(password);

    const newUser = await this.repository.createUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    });

    // devolver sin password
    return {
      id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role
    };
  }

  async authenticateUser(credentials) {
    return { token: null };
  }
}

export const sessionsService = new SessionsService(usersRepository);
export default sessionsService;
