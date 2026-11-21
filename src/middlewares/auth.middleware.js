import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware de autenticación mediante JWT almacenado en cookies.
 * Lee la cookie 'currentUser', verifica el token y adjunta el payload a req.user.
 */
export const auth = (req, res, next) => {
  const token = req.cookies?.currentUser || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }
};

export const authMiddleware = auth;
export default auth;

