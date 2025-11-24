export class Transaction {
  private transactionId: number;
  private isIncome: boolean;
  private amount: number;
  private description: string | null;
  private date: Date;
  private accountId: number;
  private categoryId: number;

  constructor(
    transactionId: number,
    isIncome: boolean,
    amount: number,
    description: string | null,
    date: Date,
    accountId: number,
    categoryId: number
  ) {
    this.transactionId = transactionId;
    this.isIncome = isIncome;
    this.amount = amount;
    this.description = description;
    this.date = date;
    this.accountId = accountId;
    this.categoryId = categoryId;
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

  public setIsIncome(isIncome: boolean): void {
    this.isIncome = isIncome;
  }

  public setAmount(amount: number): void {
    this.amount = amount;
  }

  public setDescription(description: string | null): void {
    this.description = description;
  }

  public setDate(date: Date): void {
    this.date = date;
  }

  public setCategoryId(categoryId: number): void {
    this.categoryId = categoryId;
  }

  public toJSON() {
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
