export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(status).json({
    status: 'error',
    error: message
  });
};
