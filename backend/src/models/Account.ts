import { AccountName } from './AccountName.js';
import { Currency } from './Currency.js';

export class Account {
  private accountId: number;
  private name: AccountName;
  private initialBalance: number;
  private actualBalance: number;
  private currency: Currency;
  private creationDate: Date;
  private userId: number;

  constructor(
    accountId: number,
    name: AccountName,
    initialBalance: number,
    actualBalance: number,
    currency: Currency,
    creationDate: Date,
    userId: number
  ) {
    this.accountId = accountId;
    this.name = name;
    this.initialBalance = initialBalance;
    this.actualBalance = actualBalance;
    this.currency = currency;
    this.creationDate = creationDate;
    this.userId = userId;
  }

  public getId(): number {
    return this.accountId;
  }

  public getName(): AccountName {
    return this.name;
  }

  public getInitialBalance(): number {
    return this.initialBalance;
  }

  public getActualBalance(): number {
    return this.actualBalance;
  }

  public getCurrency(): Currency {
    return this.currency;
  }

  public getCreationDate(): Date {
    return this.creationDate;
  }

  public getUserId(): number {
    return this.userId;
  }

  public setName(name: AccountName): void {
    this.name = name;
  }

  public setActualBalance(balance: number): void {
    this.actualBalance = balance;
  }

  public toJSON() {
    return {
      accountId: this.accountId,
      name: this.name.getValue(),
      initialBalance: this.initialBalance,
      actualBalance: this.actualBalance,
      currency: this.currency.getValue(),
      creationDate: this.creationDate,
      userId: this.userId,
    };
  }
}
