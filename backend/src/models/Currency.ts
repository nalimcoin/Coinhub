export class Currency {
  private readonly value: string;

  constructor(currency: string) {
    if (!Currency.isValid(currency)) {
      throw new Error('Currency must be a valid 3-letter code');
    }
    this.value = currency.toUpperCase();
  }

  public static isValid(currency: string): boolean {
    if (!currency || typeof currency !== 'string') {
      return false;
    }
    const trimmed = currency.trim();
    return /^[A-Z]{3}$/i.test(trimmed);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Currency): boolean {
    return this.value === other.value;
  }
}
