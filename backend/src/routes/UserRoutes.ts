import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

export class UserRoutes {
  private router: Router;
  private userController: UserController;
  private authMiddleware: AuthMiddleware;

  constructor(userController: UserController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.userController = userController;
    this.authMiddleware = authMiddleware;
    this.configureRoutes();
  }

  private configureRoutes(): void {
    // All user routes require authentication
    this.router.use(this.authMiddleware.authenticate);

    // Get current user profile
    this.router.get('/me', this.userController.getCurrent);

    // Get all users
    this.router.get('/', this.userController.getAll);

    // Get user by ID
    this.router.get('/:id', this.userController.getById);

    // Update user (only own profile)
    this.router.put('/:id', this.userController.update);

    // Delete user (only own account)
    this.router.delete('/:id', this.userController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
