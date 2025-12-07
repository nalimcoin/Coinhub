import { Transaction, ITransaction } from '../models/Transaction';
import { AuthService } from './AuthService';

interface CreateTransactionData {
  isIncome: boolean;
  amount: number;
  description?: string | null;
  date: Date | string;
  accountId: number;
  categoryId: number;
}

interface UpdateTransactionData {
  isIncome?: boolean;
  amount?: number;
  description?: string | null;
  date?: Date | string;
  categoryId?: number;
}

export class TransactionService {
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

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    try {
      const response = await fetch(`${this.apiUrl}/transactions`, {
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
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const result = await response.json();
      return new Transaction(result.transaction);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while creating the transaction');
    }
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.apiUrl}/transactions/account/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      const result = await response.json();
      return result.transactions.map((txn: ITransaction) => new Transaction(txn));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while fetching transactions');
    }
  }

  async getTransactionById(transactionId: number): Promise<Transaction> {
    try {
      const response = await fetch(`${this.apiUrl}/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transaction');
      }

      const result = await response.json();
      return new Transaction(result.transaction);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while fetching the transaction');
    }
  }

  async updateTransaction(transactionId: number, data: UpdateTransactionData): Promise<Transaction> {
    try {
      const response = await fetch(`${this.apiUrl}/transactions/${transactionId}`, {
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
        throw new Error(errorData.error || 'Failed to update transaction');
      }

      const result = await response.json();
      return new Transaction(result.transaction);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while updating the transaction');
    }
  }

  async deleteTransaction(transactionId: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      this.handleResponse(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete transaction');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred while deleting the transaction');
    }
  }
}
