import sessionsService from '../services/sessions.service.js';

export const register = async (req, res, next) => {
  try {
    const result = await sessionsService.registerUser(req.body);
    return res.status(200).json({
      status: 'success',
      payload: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await sessionsService.authenticateUser(req.body);
    return res.status(200).json({
      status: 'success',
      payload: result
    });
  } catch (error) {
    next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: 'success',
      payload: null
    });
  } catch (error) {
    next(error);
  }
};
