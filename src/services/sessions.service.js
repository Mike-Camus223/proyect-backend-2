import usersRepository from '../repositories/users.repository.js';
import UserDTO from '../dto/user.dto.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class SessionsService {
  constructor(repository) {
    this.repository = repository;
  }

  async registerUser({ first_name, last_name, email, password }) {
    if (!first_name || !last_name || !email || !password) {
      throw createHttpError('Faltan campos obligatorios', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createHttpError('Formato de email inválido', 400);
    }

    if (password.length < 6) {
      throw createHttpError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await this.repository.findByEmail(normalizedEmail);
    if (exists) {
      throw createHttpError('El email ya está registrado', 409);
    }

    const hashedPassword = createHash(password);

    const newUser = await this.repository.createUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    });

    return UserDTO.from(newUser);
  }

  async validateCredentials({ email, password }) {
    if (!email || !password) {
      throw createHttpError('Credenciales inválidas', 401);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.repository.findByEmail(normalizedEmail);

    if (!user || !isValidPassword(password, user.password)) {
      throw createHttpError('Credenciales inválidas', 401);
    }

    return UserDTO.current(user);
  }

  async loginUser(credentials) {
    const user = await this.validateCredentials(credentials);
    const token = generateToken(user);
    return { token, user };
  }

  async authenticateUser(credentials) {
    return this.loginUser(credentials);
  }
}

export const sessionsService = new SessionsService(usersRepository);
export default sessionsService;
