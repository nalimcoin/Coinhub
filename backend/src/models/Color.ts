export class Color {
  private readonly value: string;

  constructor(color: string) {
    if (!Color.isValid(color)) {
      throw new Error('Color must be a valid hexadecimal format (#RRGGBB)');
    }
    this.value = color.toUpperCase();
  }

  public static isValid(color: string): boolean {
    if (!color || typeof color !== 'string') {
      return false;
    }
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Color): boolean {
    return this.value === other.value;
  }
}
