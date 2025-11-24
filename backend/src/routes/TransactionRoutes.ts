import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export class TransactionRoutes {
  private router: Router;
  private transactionController: TransactionController;
  private authMiddleware: AuthMiddleware;

  constructor(transactionController: TransactionController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.transactionController = transactionController;
    this.authMiddleware = authMiddleware;
    this.configureRoutes();
  }

  private configureRoutes(): void {
    this.router.use(this.authMiddleware.authenticate);

    this.router.post('/', this.transactionController.create);

    this.router.get('/', this.transactionController.getAll);

    this.router.get('/:id', this.transactionController.getById);

    this.router.get('/account/:accountId', this.transactionController.getByAccountId);

    this.router.put('/:id', this.transactionController.update);

    this.router.delete('/:id', this.transactionController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
