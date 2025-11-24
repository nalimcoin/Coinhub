export interface ITransaction {
  transactionId: number;
  isIncome: boolean;
  amount: number;
  description: string | null;
  date: Date;
  accountId: number;
  categoryId: number;
}

export class Transaction {
  private transactionId: number;
  private isIncome: boolean;
  private amount: number;
  private description: string | null;
  private date: Date;
  private accountId: number;
  private categoryId: number;

  constructor(data: ITransaction) {
    this.transactionId = data.transactionId;
    this.isIncome = data.isIncome;
    this.amount = data.amount;
    this.description = data.description;
    this.date = new Date(data.date);
    this.accountId = data.accountId;
    this.categoryId = data.categoryId;
  }

  public getId(): number {
    return this.transactionId;
  }

  public isIncomeTransaction(): boolean {
    return this.isIncome;
  }

  public getAmount(): number {
    return this.amount;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getDate(): Date {
    return this.date;
  }

  public getAccountId(): number {
    return this.accountId;
  }

  public getCategoryId(): number {
    return this.categoryId;
  }

  public getFormattedAmount(currency: string): string {
    const amount = (this.amount / 100).toFixed(2);
    return `${amount} ${currency}`;
  }

  public toJSON(): ITransaction {
    return {
      transactionId: this.transactionId,
      isIncome: this.isIncome,
      amount: this.amount,
      description: this.description,
      date: this.date,
      accountId: this.accountId,
      categoryId: this.categoryId,
    };
  }
}
