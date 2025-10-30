import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const result = await this.authService.login(email, password);

      res.status(200).json({
        message: 'Login successful',
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  public register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body as RegisterRequest;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: 'Email, password, first name, and last name are required' });
        return;
      }
      const result = await this.authService.register(email, password, firstName, lastName);

      res.status(201).json({
        message: 'Registration successful',
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  public verify = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as any).user;

      res.status(200).json({
        message: 'Token is valid',
        user: {
          id: user.userId,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}