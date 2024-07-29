import { HttpError } from '../utils/HttpError.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      status: err.status,
      message:
        err.message || 'An error occurred while processing your request.',
    });
  }

  res.status(500).json({
    message: 'An unexpected error occurred. Please try again later.',
    error: err.message,
  });
};
