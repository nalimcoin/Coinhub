import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/CategoryService.js';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js';

interface CreateCategoryRequest {
  name: string;
  description?: string | null;
  color: string;
}

interface UpdateCategoryRequest {
  name?: string;
  description?: string | null;
  color?: string;
}

export class CategoryController {
  private categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  public create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, description, color } = req.body as CreateCategoryRequest;

      if (!name || !color) {
        res.status(400).json({ error: 'Name and color are required' });
        return;
      }

      const category = await this.categoryService.createCategory(
        name,
        description || null,
        color,
        userId
      );

      res.status(201).json({
        message: 'Category created successfully',
        category: category.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);

      if (isNaN(categoryId)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const category = await this.categoryService.getCategoryById(categoryId);

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.status(200).json({
        message: 'Category retrieved successfully',
        category: category.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const categories = await this.categoryService.getCategoriesByUserId(userId);

      res.status(200).json({
        message: 'All categories retrieved successfully',
        categories: categories.map(category => category.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const categoryId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(categoryId)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const existingCategory = await this.categoryService.getCategoryById(categoryId);

      if (!existingCategory) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      if (existingCategory.getUserId() !== userId) {
        res.status(403).json({ error: 'Forbidden: You can only update your own categories' });
        return;
      }

      const { name, description, color } = req.body as UpdateCategoryRequest;

      const updatedCategory = await this.categoryService.updateCategory(categoryId, {
        name,
        description,
        color,
      });

      res.status(200).json({
        message: 'Category updated successfully',
        category: updatedCategory.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const categoryId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(categoryId)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const existingCategory = await this.categoryService.getCategoryById(categoryId);

      if (!existingCategory) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      if (existingCategory.getUserId() !== userId) {
        res.status(403).json({ error: 'Forbidden: You can only delete your own categories' });
        return;
      }

      await this.categoryService.deleteCategory(categoryId);

      res.status(200).json({
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
