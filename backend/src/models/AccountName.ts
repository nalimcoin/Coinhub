export class AccountName {
  private readonly value: string;

  constructor(name: string) {
    if (!AccountName.isValid(name)) {
      throw new Error('Account name must be between 5 and 50 characters');
    }
    this.value = name.trim();
  }

  public static isValid(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }
    const trimmed = name.trim();
    return trimmed.length > 4 && trimmed.length <= 50;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: AccountName): boolean {
    return this.value === other.value;
  }
}
