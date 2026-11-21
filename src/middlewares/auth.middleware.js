import passport from 'passport';

/**
 * Callback reutilizable para manejar las respuestas de Passport sin sesiones
 * manteniendo el formato JSON estandarizado de la API.
 */
export const passportCallback = (req, res, next, defaultStatus, defaultMessage, forceDefaultMessage = false) => {
  return (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      const status = info?.statusCode || defaultStatus;
      const message =
        forceDefaultMessage || !info?.message || info.message === 'Missing credentials'
          ? defaultMessage
          : info.message;

      return res.status(status).json({
        status: 'error',
        message
      });
    }

    req.user = user;
    next();
  };
};

/**
 * Middleware de autenticación que delega la validación en la estrategia 'current' de Passport.
 */
export const auth = (req, res, next) => {
  return passport.authenticate(
    'current',
    { session: false },
    passportCallback(req, res, next, 401, 'No autenticado', true)
  )(req, res, next);
};

export const authMiddleware = auth;
export default auth;
