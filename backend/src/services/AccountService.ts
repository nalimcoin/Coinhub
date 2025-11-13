import { AccountRepository } from '../repositories/AccountRepository.js';
import { Account } from '../models/Account.js';
import { AccountName } from '../models/AccountName.js';
import { Currency } from '../models/Currency.js';

export class AccountService {
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  public async createAccount(name: string, initialBalance: number, currency: string, userId: number): Promise<Account> {
    const accountName = new AccountName(name);
    const accountCurrency = new Currency(currency);

    return this.accountRepository.create(accountName, initialBalance, accountCurrency, userId);
  }

  public async getAccountById(accountId: number): Promise<Account | null> {
    return this.accountRepository.findById(accountId);
  }

  public async getAccountsByUserId(userId: number): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }

  public async getAllAccounts(): Promise<Account[]> {
    return this.accountRepository.findAll();
  }

  public async updateAccount(accountId: number, data: { name?: string; initialBalance?: number; actualBalance?: number; currency?: string }): Promise<Account> {
    const updateData: { name?: AccountName; initialBalance?: number; actualBalance?: number; currency?: Currency } = {};

    if (data.name) {
      updateData.name = new AccountName(data.name);
    }

    if (data.initialBalance !== undefined) {
      updateData.initialBalance = data.initialBalance;
    }

    if (data.actualBalance !== undefined) {
      updateData.actualBalance = data.actualBalance;
    }

    if (data.currency) {
      updateData.currency = new Currency(data.currency);
    }

    return this.accountRepository.update(accountId, updateData);
  }

  public async deleteAccount(accountId: number): Promise<void> {
    return this.accountRepository.delete(accountId);
  }

  public async updateBalance(accountId: number, newBalance: number): Promise<Account> {
    return this.accountRepository.updateBalance(accountId, newBalance);
  }
}
