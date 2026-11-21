import { config } from '../config/env.config.js';
import { generateToken } from '../utils/jwt.js';
import UserDTO from '../dto/user.dto.js';

export const register = async (req, res, next) => {
  try {
    return res.status(201).json({
      status: 'success',
      payload: req.user
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const token = generateToken(UserDTO.current(req.user));

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
    return next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: 'success',
      payload: UserDTO.current(req.user)
    });
  } catch (error) {
    return next(error);
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
    return next(error);
  }
};
