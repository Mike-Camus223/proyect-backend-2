export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: err.message || 'Datos inválidos'
    });
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(status).json({
    status: 'error',
    message
  });
};
