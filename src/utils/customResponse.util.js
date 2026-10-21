export const buildResponse = (res, statusCode, statusText, dataOrMessage) => {
  const isError = statusCode >= 400;
  return res.status(statusCode).json({
    status: statusText,
    [isError ? 'error' : 'payload']: dataOrMessage
  });
};
