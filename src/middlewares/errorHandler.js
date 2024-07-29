import { HttpError } from '../utils/HttpError.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack); 

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    error: err.details || 'No additional details'
  });
};
