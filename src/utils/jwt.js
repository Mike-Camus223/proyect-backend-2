import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';

/**
 * Genera un token JWT firmado con la clave secreta y tiempo de expiración configurable.
 * @param {Object} payload Información del usuario { id, email, role }
 * @returns {string} Token JWT generado
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Verifica la autenticidad y vigencia de un token JWT.
 * @param {string} token Token JWT a verificar
 * @returns {Object} Payload decodificado si el token es válido
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

export default {
  generateToken,
  verifyToken
};

