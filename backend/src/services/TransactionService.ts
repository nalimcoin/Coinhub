import { TransactionRepository } from '../repositories/TransactionRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { AccountService } from './AccountService.js';
import { Transaction } from '../models/Transaction.js';

export class TransactionService {
  private transactionRepository: TransactionRepository;
  private categoryRepository: CategoryRepository;
  private accountService: AccountService;

  constructor(transactionRepository: TransactionRepository, categoryRepository: CategoryRepository, accountService: AccountService) {
    this.transactionRepository = transactionRepository;
    this.categoryRepository = categoryRepository;
    this.accountService = accountService;
  }

  public async createTransaction(
    isIncome: boolean,
    amount: number,
    description: string | null,
    date: Date,
    accountId: number,
    categoryId: number
  ): Promise<Transaction> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found. Please select a valid category.');
    }

    const transaction = await this.transactionRepository.create(isIncome, amount, description, date, accountId, categoryId);

    // Recalculate and update account balance
    await this.accountService.calculateAndUpdateBalance(accountId);

    return transaction;
  }

  public async getTransactionById(transactionId: number): Promise<Transaction | null> {
    return this.transactionRepository.findById(transactionId);
  }

  public async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    return this.transactionRepository.findByAccountId(accountId);
  }

  public async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  public async updateTransaction(
    transactionId: number,
    data: { isIncome?: boolean; amount?: number; description?: string | null; date?: Date; categoryId?: number }
  ): Promise<Transaction> {
    if (data.categoryId !== undefined) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new Error('Category not found. Please select a valid category.');
      }
    }

    // Get the transaction to find its account ID
    const existingTransaction = await this.transactionRepository.findById(transactionId);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = await this.transactionRepository.update(transactionId, data);

    // Recalculate and update account balance
    await this.accountService.calculateAndUpdateBalance(existingTransaction.getAccountId());

    return updatedTransaction;
  }

  public async deleteTransaction(transactionId: number): Promise<void> {
    // Get the transaction to find its account ID before deleting
    const existingTransaction = await this.transactionRepository.findById(transactionId);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    const accountId = existingTransaction.getAccountId();

    await this.transactionRepository.delete(transactionId);

    // Recalculate and update account balance
    await this.accountService.calculateAndUpdateBalance(accountId);
  }
}
