import { config } from '../config/env.config.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    return res.status(201).json({
      status: 'success',
      payload: req.user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // El controller genera el JWT y setea la cookie luego de que Passport valida las credenciales
    const token = generateToken({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });

    res.cookie('currentUser', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600000,
      secure: config.nodeEnv === 'production'
    });

    return res.status(200).json({
      status: 'success',
      message: 'Login correcto'
    });
  } catch (error) {
    next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: 'success',
      payload: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('currentUser', {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'production'
    });

    return res.status(200).json({
      status: 'success',
      message: 'Sesión cerrada'
    });
  } catch (error) {
    next(error);
  }
};
