/**
 * Middleware reutilizable de autorización por roles.
 * Recibe los roles permitidos y valida contra req.user.role (poblado por auth).
 */
export const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tenés permisos para realizar esta acción'
      });
    }

    next();
  };
};

export default authorize;
