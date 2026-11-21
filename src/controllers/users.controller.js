import usersService from '../services/users.service.js';

const handleControllerError = (error, res, next) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }
  return next(error);
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();
    return res.status(200).json({
      status: 'success',
      payload: users
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    return res.status(200).json({
      status: 'success',
      payload: user
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const updated = await usersService.updateUserRole(req.params.id, req.body.role);
    return res.status(200).json({
      status: 'success',
      payload: updated
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
};

