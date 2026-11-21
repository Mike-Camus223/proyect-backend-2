import usersRepository from '../repositories/users.repository.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

class SessionsService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Registra un nuevo usuario en la base de datos tras validar los campos.
   */
  async registerUser({ first_name, last_name, email, password }) {
    if (!first_name || !last_name || !email || !password) {
      const error = new Error('Faltan campos obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Formato de email inválido');
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await this.repository.getUserByEmail(normalizedEmail);
    if (exists) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = createHash(password);

    // Rol user fijo por defecto sin permitir manipulación desde el body
    const newUser = await this.repository.createUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    });

    return {
      id: newUser._id.toString(),
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role
    };
  }

  /**
   * Valida las credenciales de un usuario y devuelve su payload básico sin password.
   */
  async validateCredentials({ email, password }) {
    if (!email || !password) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.repository.getUserByEmail(normalizedEmail);

    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = isValidPassword(password, user.password);
    if (!isMatch) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
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
