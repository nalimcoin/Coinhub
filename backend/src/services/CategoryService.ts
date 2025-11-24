import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { Category } from '../models/Category.js';
import { CategoryName } from '../models/CategoryName.js';
import { Color } from '../models/Color.js';

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor(categoryRepository: CategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  public async createCategory(name: string, description: string | null, color: string, userId: number): Promise<Category> {
    const categoryName = new CategoryName(name);
    const categoryColor = new Color(color);

    return this.categoryRepository.create(categoryName, description, categoryColor, userId);
  }

  public async getCategoryById(categoryId: number): Promise<Category | null> {
    return this.categoryRepository.findById(categoryId);
  }

  public async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  public async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return this.categoryRepository.findByUserId(userId);
  }

  public async updateCategory(categoryId: number, data: { name?: string; description?: string | null; color?: string }): Promise<Category> {
    const updateData: { name?: CategoryName; description?: string | null; color?: Color } = {};

    if (data.name) {
      updateData.name = new CategoryName(data.name);
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.color) {
      updateData.color = new Color(data.color);
    }

    return this.categoryRepository.update(categoryId, updateData);
  }

  public async deleteCategory(categoryId: number): Promise<void> {
    const isUsed = await this.categoryRepository.isUsedInTransactions(categoryId);

    if (isUsed) {
      throw new Error('Cannot delete category that is used in transactions');
    }

    return this.categoryRepository.delete(categoryId);
  }
}
