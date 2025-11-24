import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export class CategoryRoutes {
  private router: Router;
  private categoryController: CategoryController;
  private authMiddleware: AuthMiddleware;

  constructor(categoryController: CategoryController, authMiddleware: AuthMiddleware) {
    this.router = Router();
    this.categoryController = categoryController;
    this.authMiddleware = authMiddleware;
    this.configureRoutes();
  }

  private configureRoutes(): void {
    this.router.use(this.authMiddleware.authenticate);

    this.router.post('/', this.categoryController.create);

    this.router.get('/', this.categoryController.getAll);

    this.router.get('/:id', this.categoryController.getById);

    this.router.put('/:id', this.categoryController.update);

    this.router.delete('/:id', this.categoryController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
