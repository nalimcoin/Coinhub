import { Request, Response, NextFunction } from 'express';
import * as xss from 'xss';

export class SanitizationMiddleware {
  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return xss(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => SanitizationMiddleware.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = SanitizationMiddleware.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  public static sanitize = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (req.body) {
      req.body = SanitizationMiddleware.sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = SanitizationMiddleware.sanitizeObject(req.query);
    }
    if (req.params) {
      req.params = SanitizationMiddleware.sanitizeObject(req.params);
    }

    next();
  };
}