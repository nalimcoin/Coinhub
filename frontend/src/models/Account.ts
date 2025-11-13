export interface IAccount {
  accountId: number;
  name: string;
  initialBalance: number;
  actualBalance: number;
  currency: string;
  creationDate: Date;
  userId: number;
}

export class Account {
  private accountId: number;
  private name: string;
  private initialBalance: number;
  private actualBalance: number;
  private currency: string;
  private creationDate: Date;
  private userId: number;

  constructor(data: IAccount) {
    this.accountId = data.accountId;
    this.name = data.name;
    this.initialBalance = data.initialBalance;
    this.actualBalance = data.actualBalance;
    this.currency = data.currency;
    this.creationDate = new Date(data.creationDate);
    this.userId = data.userId;
  }

  public getId(): number {
    return this.accountId;
  }

  public getName(): string {
    return this.name;
  }

  public getInitialBalance(): number {
    return this.initialBalance;
  }

  public getActualBalance(): number {
    return this.actualBalance;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getCreationDate(): Date {
    return this.creationDate;
  }

  public getUserId(): number {
    return this.userId;
  }

  public getFormattedBalance(): string {
    const amount = (this.actualBalance / 100).toFixed(2);
    return `${amount} ${this.currency}`;
  }

  public getFormattedInitialBalance(): string {
    const amount = (this.initialBalance / 100).toFixed(2);
    return `${amount} ${this.currency}`;
  }

  public toJSON(): IAccount {
    return {
      accountId: this.accountId,
      name: this.name,
      initialBalance: this.initialBalance,
      actualBalance: this.actualBalance,
      currency: this.currency,
      creationDate: this.creationDate,
      userId: this.userId,
    };
  }
}
