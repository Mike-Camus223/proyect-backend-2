export const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: err.message || 'Datos inválidos'
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      status: 'error',
      message: 'El recurso ya existe'
    });
  }

  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    console.error('Unhandled Error:', err);
  }

  const message = status >= 500 && !err.statusCode ? 'Error interno del servidor' : err.message || 'Error interno del servidor';

  return res.status(status).json({
    status: 'error',
    message
  });
};
