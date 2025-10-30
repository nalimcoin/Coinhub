import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

export class AuthRoutes {
  private router: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor(authController: AuthController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.authController = authController;
    this.authMiddleware = authMiddleware;
    this.configureRoutes();
  }

  private configureRoutes(): void {
    this.router.post('/login', this.authController.login);
    this.router.post('/register', this.authController.register);
    this.router.get(
      '/verify',
      this.authMiddleware.authenticate,
      this.authController.verify
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}