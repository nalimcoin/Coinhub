import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/TransactionService.js';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js';
import { AccountService } from '../services/AccountService.js';

interface CreateTransactionRequest {
  isIncome: boolean;
  amount: number;
  description?: string | null;
  date: string | Date;
  accountId: number;
  categoryId: number;
}

interface UpdateTransactionRequest {
  isIncome?: boolean;
  amount?: number;
  description?: string | null;
  date?: string | Date;
  categoryId?: number;
}

export class TransactionController {
  private transactionService: TransactionService;
  private accountService: AccountService;

  constructor(transactionService: TransactionService, accountService: AccountService) {
    this.transactionService = transactionService;
    this.accountService = accountService;
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

      const { isIncome, amount, description, date, accountId, categoryId } = req.body as CreateTransactionRequest;

      if (isIncome === undefined || !amount || !date || !accountId || !categoryId) {
        res.status(400).json({ error: 'isIncome, amount, date, accountId, and categoryId are required' });
        return;
      }

      const account = await this.accountService.getAccountById(accountId);
      if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
      }

      if (account.getUserId() !== userId) {
        res.status(403).json({ error: 'Forbidden: You can only create transactions for your own accounts' });
        return;
      }

      const transaction = await this.transactionService.createTransaction(
        isIncome,
        amount,
        description || null,
        new Date(date),
        accountId,
        categoryId
      );

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction: transaction.toJSON(),
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
      const transactionId = parseInt(req.params.id);

      if (isNaN(transactionId)) {
        res.status(400).json({ error: 'Invalid transaction ID' });
        return;
      }

      const transaction = await this.transactionService.getTransactionById(transactionId);

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.status(200).json({
        message: 'Transaction retrieved successfully',
        transaction: transaction.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getByAccountId = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const accountId = parseInt(req.params.accountId);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(accountId)) {
        res.status(400).json({ error: 'Invalid account ID' });
        return;
      }

      const account = await this.accountService.getAccountById(accountId);
      if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
      }

      if (account.getUserId() !== userId) {
        res.status(403).json({ error: 'Forbidden: You can only view transactions for your own accounts' });
        return;
      }

      const transactions = await this.transactionService.getTransactionsByAccountId(accountId);

      res.status(200).json({
        message: 'Transactions retrieved successfully',
        transactions: transactions.map(transaction => transaction.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const transactions = await this.transactionService.getAllTransactions();

      res.status(200).json({
        message: 'All transactions retrieved successfully',
        transactions: transactions.map(transaction => transaction.toJSON()),
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
      const transactionId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(transactionId)) {
        res.status(400).json({ error: 'Invalid transaction ID' });
        return;
      }

      const existingTransaction = await this.transactionService.getTransactionById(transactionId);

      if (!existingTransaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      const account = await this.accountService.getAccountById(existingTransaction.getAccountId());
      if (!account || account.getUserId() !== userId) {
        res.status(403).json({ error: 'Forbidden: You can only update your own transactions' });
        return;
      }

      const { isIncome, amount, description, date, categoryId } = req.body as UpdateTransactionRequest;

      const updatedTransaction = await this.transactionService.updateTransaction(transactionId, {
        isIncome,
        amount,
        description,
        date: date ? new Date(date) : undefined,
        categoryId,
      });

      res.status(200).json({
        message: 'Transaction updated successfully',
        transaction: updatedTransaction.toJSON(),
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
      const transactionId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(transactionId)) {
        res.status(400).json({ error: 'Invalid transaction ID' });
        return;
      }

      const existingTransaction = await this.transactionService.getTransactionById(transactionId);

      if (!existingTransaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      const account = await this.accountService.getAccountById(existingTransaction.getAccountId());
      if (!account || account.getUserId() !== userId) {
        res.status(403).json({ error: 'Forbidden: You can only delete your own transactions' });
        return;
      }

      await this.transactionService.deleteTransaction(transactionId);

      res.status(200).json({
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
