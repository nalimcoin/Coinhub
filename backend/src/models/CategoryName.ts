export class CategoryName {
  private readonly value: string;

  constructor(name: string) {
    if (!CategoryName.isValid(name)) {
      throw new Error('Category name must be between 2 and 50 characters');
    }
    this.value = name.trim();
  }

  public static isValid(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: CategoryName): boolean {
    return this.value === other.value;
  }
}
