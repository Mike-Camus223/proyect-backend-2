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
    // Validar campos obligatorios
    if (!first_name || !last_name || !email || !password) {
      const error = new Error('Faltan campos obligatorios');
      error.statusCode = 400;
      throw error;
    }

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Formato de email inválido');
      error.statusCode = 400;
      throw error;
    }

    // Longitud mínima de contraseña
    if (password.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // Comprobar existencia previa de email
    const exists = await this.repository.getUserByEmail(normalizedEmail);
    if (exists) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 409;
      throw error;
    }

    // Hashear contraseña y asignar rol por defecto
    const hashedPassword = createHash(password);

    const newUser = await this.repository.createUser({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    });

    // Devolver datos del usuario sin exponer la contraseña
    return {
      id: newUser._id.toString(),
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role
    };
  }

  /**
   * Autentica un usuario verificando credenciales y genera el token JWT.
   */
  async loginUser({ email, password }) {
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

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = generateToken(payload);

    return {
      token,
      user: payload
    };
  }

  // Alias compatible con código previo
  async authenticateUser(credentials) {
    return this.loginUser(credentials);
  }
}

export const sessionsService = new SessionsService(usersRepository);
export default sessionsService;
