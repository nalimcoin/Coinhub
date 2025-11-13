import { Account, IAccount } from '../models/Account';

interface CreateAccountData {
  name: string;
  initialBalance: number;
  currency: string;
}

interface UpdateAccountData {
  name?: string;
  initialBalance?: number;
  actualBalance?: number;
  currency?: string;
}

export class AccountService {
  private readonly apiUrl: string;

  constructor(apiUrl: string = 'http://localhost:3001/api') {
    this.apiUrl = apiUrl;
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

  async createAccount(data: CreateAccountData): Promise<Account> {
    try {
      const response = await fetch(`${this.apiUrl}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const result = await response.json();
      return new Account(result.account);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while creating the account');
    }
  }

  async getAccountsByUserId(userId: number): Promise<Account[]> {
    try {
      const response = await fetch(`${this.apiUrl}/accounts/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch accounts');
      }

      const result = await response.json();
      return result.accounts.map((acc: IAccount) => new Account(acc));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while fetching accounts');
    }
  }

  async getAccountById(accountId: number): Promise<Account> {
    try {
      const response = await fetch(`${this.apiUrl}/accounts/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch account');
      }

      const result = await response.json();
      return new Account(result.account);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while fetching the account');
    }
  }

  async updateAccount(accountId: number, data: UpdateAccountData): Promise<Account> {
    try {
      const response = await fetch(`${this.apiUrl}/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account');
      }

      const result = await response.json();
      return new Account(result.account);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while updating the account');
    }
  }

  async deleteAccount(accountId: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while deleting the account');
    }
  }
}
