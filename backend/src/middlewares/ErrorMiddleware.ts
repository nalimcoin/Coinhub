import { Request, Response, NextFunction } from 'express';

export class ErrorMiddleware {
  public static handle = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    console.error('[ERROR]', {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    let statusCode = 500;
    let message = 'An error occurred. Please try again later.';

    if (error.message.includes('Invalid') || 
        error.message.includes('must') ||
        error.message.includes('cannot be empty') ||
        error.message.includes('already exists')) {
      statusCode = 400;
      message = error.message;
    }

    if (error.message.includes('credentials') ||
        error.message.includes('Authentication') ||
        error.message.includes('Token') ||
        error.message.includes('expired')) {
      statusCode = 401;
      message = error.message;
    }

    if (error.message.includes('Permission') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden')) {
      statusCode = 403;
      message = error.message;
    }

    if (error.message.includes('not found')) {
      statusCode = 404;
      message = error.message;
    }

    const response: any = {
      error: message,
    };

    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
      response.details = error.message;
    }

    res.status(statusCode).json(response);
  };

  public static notFound = (req: Request, res: Response): void => {
    res.status(404).json({
      error: 'Route not found',
    });
  };
}