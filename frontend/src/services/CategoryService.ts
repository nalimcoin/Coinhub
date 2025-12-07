import { Category, ICategory } from '../models/Category';
import { AuthService } from './AuthService';

interface CreateCategoryData {
  name: string;
  description?: string | null;
  color: string;
}

interface UpdateCategoryData {
  name?: string;
  description?: string | null;
  color?: string;
}

export class CategoryService {
  private readonly apiUrl: string;
  private authService: AuthService;

  constructor(apiUrl: string = 'http://localhost:3001/api', authService?: AuthService) {
    this.apiUrl = apiUrl;
    this.authService = authService || new AuthService(apiUrl);
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('coinhub_token');
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  }

  private handleResponse(response: Response): void {
    if (response.status === 401) {
      this.authService.handleUnauthorized();
    }
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    try {
      const response = await fetch(`${this.apiUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      const result = await response.json();
      return new Category(result.category);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while creating the category');
    }
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.apiUrl}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch categories');
      }

      const result = await response.json();
      return result.categories.map((cat: ICategory) => new Category(cat));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while fetching categories');
    }
  }

  async getCategoryById(categoryId: number): Promise<Category> {
    try {
      const response = await fetch(`${this.apiUrl}/categories/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch category');
      }

      const result = await response.json();
      return new Category(result.category);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while fetching the category');
    }
  }

  async updateCategory(categoryId: number, data: UpdateCategoryData): Promise<Category> {
    try {
      const response = await fetch(`${this.apiUrl}/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      const result = await response.json();
      return new Category(result.category);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while updating the category');
    }
  }

  async deleteCategory(categoryId: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while deleting the category');
    }
  }
}
