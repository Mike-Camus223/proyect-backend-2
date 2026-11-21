import sessionsService from '../services/sessions.service.js';
import { config } from '../config/env.config.js';

export const register = async (req, res, next) => {
  try {
    const user = await sessionsService.registerUser(req.body);
    return res.status(201).json({
      status: 'success',
      payload: user
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { token } = await sessionsService.loginUser(req.body);

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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    }
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
