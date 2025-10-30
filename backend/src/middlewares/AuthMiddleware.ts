import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/JwtService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export class AuthMiddleware {
  private jwtService: JwtService;

  constructor(jwtService: JwtService) {
    this.jwtService = jwtService;
  }

  public authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const parts = authHeader.split(' ');
      
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({ error: 'Invalid authorization format' });
        return;
      }

      const token = parts[1];
      const payload = this.jwtService.verifyToken(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
      };

      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    }
  };
}