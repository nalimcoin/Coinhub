import { IAuthResponse } from '../types';
import { User } from '../models/User';
import { LoginCredentials } from '../models/LoginCredentials';
import { RegisterCredentials } from '../models/RegisterCredentials';

export class AuthService {
  private readonly apiUrl: string;
  private readonly tokenKey: string = 'coinhub_token';

  constructor(apiUrl: string = 'http://localhost:3001/api') {
    this.apiUrl = apiUrl;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    if (!credentials.isValid()) {
      const errors = credentials.getValidationErrors();
      throw new Error(errors.join(', '));
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials.toJSON()),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la connexion');
      }

      const data: IAuthResponse = await response.json();

      this.saveToken(data.accessToken);

      return new User(data.user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la connexion');
    }
  }

  private saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    if (!credentials.isValid()) {
      const errors = credentials.getValidationErrors();
      throw new Error(errors.join(', '));
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials.toJSON()),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de l\'inscription');
      }

      const data: IAuthResponse = await response.json();

      this.saveToken(data.accessToken);

      return new User(data.user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur est survenue lors de l\'inscription');
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  }
}
