import { User } from '../models/User';
import { AuthService } from './AuthService';

export interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export class UserService {
  private readonly apiUrl: string;
  private authService: AuthService;

  constructor(apiUrl: string = 'http://localhost:3001/api', authService?: AuthService) {
    this.apiUrl = apiUrl;
    this.authService = authService || new AuthService(apiUrl);
  }

  private handleResponse(response: Response): void {
    if (response.status === 401) {
      this.authService.handleUnauthorized();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(`${this.apiUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.authService.getAuthHeader(),
        },
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la récupération de l\'utilisateur');
      }

      const data = await response.json();
      return new User(data.user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la récupération de l\'utilisateur');
    }
  }

  async updateUser(userId: number, updateData: UpdateUserData): Promise<User> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.authService.getAuthHeader(),
        },
        body: JSON.stringify(updateData),
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la mise à jour de l\'utilisateur');
      }

      const data = await response.json();
      return new User(data.user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la mise à jour de l\'utilisateur');
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.authService.getAuthHeader(),
        },
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la suppression de l\'utilisateur');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la suppression de l\'utilisateur');
    }
  }
}
