import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof UnauthorizedError) {
    res.status(err.status).set(err.headers).json({
      error: err.statusCode || 'unauthorized',
      message: 'Authentication required',
    });
  } else {
    res.status(500).json({
      error: 'server_error',
      message: 'Internal Server Error',
    });
  }
}