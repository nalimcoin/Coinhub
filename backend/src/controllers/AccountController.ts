import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/AccountService.js';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js';

interface CreateAccountRequest {
  name: string;
  initialBalance: number;
  currency: string;
}

interface UpdateAccountRequest {
  name?: string;
  initialBalance?: number;
  actualBalance?: number;
  currency?: string;
}

export class AccountController {
  private accountService: AccountService;

  constructor(accountService: AccountService) {
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

      const { name, initialBalance, currency } = req.body as CreateAccountRequest;

      if (!name || initialBalance === undefined || !currency) {
        res.status(400).json({ error: 'Name, initial balance, and currency are required' });
        return;
      }

      const account = await this.accountService.createAccount(name, initialBalance, currency, userId);

      res.status(201).json({
        message: 'Account created successfully',
        account: account.toJSON(),
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
      const accountId = parseInt(req.params.id);

      if (isNaN(accountId)) {
        res.status(400).json({ error: 'Invalid account ID' });
        return;
      }

      const account = await this.accountService.getAccountById(accountId);

      if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
      }

      res.status(200).json({
        message: 'Account retrieved successfully',
        account: account.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getByUserId = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const targetUserId = parseInt(req.params.userId);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(targetUserId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      if (userId !== targetUserId) {
        res.status(403).json({ error: 'Forbidden: You can only view your own accounts' });
        return;
      }

      const accounts = await this.accountService.getAccountsByUserId(targetUserId);

      res.status(200).json({
        message: 'Accounts retrieved successfully',
        accounts: accounts.map(account => account.toJSON()),
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
      const accounts = await this.accountService.getAllAccounts();

      res.status(200).json({
        message: 'All accounts retrieved successfully',
        accounts: accounts.map(account => account.toJSON()),
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
      const accountId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(accountId)) {
        res.status(400).json({ error: 'Invalid account ID' });
        return;
      }

      const existingAccount = await this.accountService.getAccountById(accountId);

      if (!existingAccount) {
        res.status(404).json({ error: 'Account not found' });
        return;
      }

      if (existingAccount.getUserId() !== userId) {
        res.status(403).json({ error: 'Forbidden: You can only update your own accounts' });
        return;
      }

      const { name, initialBalance, actualBalance, currency } = req.body as UpdateAccountRequest;

      const updatedAccount = await this.accountService.updateAccount(accountId, {
        name,
        initialBalance,
        actualBalance,
        currency,
      });

      res.status(200).json({
        message: 'Account updated successfully',
        account: updatedAccount.toJSON(),
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
      const accountId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(accountId)) {
        res.status(400).json({ error: 'Invalid account ID' });
        return;
      }

      const existingAccount = await this.accountService.getAccountById(accountId);

      if (!existingAccount) {
        res.status(404).json({ error: 'Account not found' });
        return;
      }

      if (existingAccount.getUserId() !== userId) {
        res.status(403).json({ error: 'Forbidden: You can only delete your own accounts' });
        return;
      }

      await this.accountService.deleteAccount(accountId);

      res.status(200).json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
