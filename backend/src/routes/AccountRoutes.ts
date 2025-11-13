import { Router } from 'express';
import { AccountController } from '../controllers/AccountController.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export class AccountRoutes {
  private router: Router;
  private accountController: AccountController;
  private authMiddleware: AuthMiddleware;

  constructor(accountController: AccountController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.accountController = accountController;
    this.authMiddleware = authMiddleware;
    this.configureRoutes();
  }

  private configureRoutes(): void {
    this.router.use(this.authMiddleware.authenticate);

    this.router.post('/', this.accountController.create);

    this.router.get('/', this.accountController.getAll);

    this.router.get('/:id', this.accountController.getById);

    this.router.get('/user/:userId', this.accountController.getByUserId);

    this.router.put('/:id', this.accountController.update);

    this.router.delete('/:id', this.accountController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
