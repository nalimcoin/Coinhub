import * as argon2 from 'argon2';

export class Password {
  private readonly hashedValue: string;

  private constructor(hashedPassword: string) {
    this.hashedValue = hashedPassword;
    Object.freeze(this);
  }

  public static async createFromPlainText(plainPassword: string): Promise<Password> {
    Password.validate(plainPassword);

    const hashedPassword = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    return new Password(hashedPassword);
  }

  public static createFromHash(hashedPassword: string): Password {
    if (!hashedPassword || typeof hashedPassword !== 'string') {
      throw new Error('Invalid hashed password');
    }
    return new Password(hashedPassword);
  }

  private static validate(plainPassword: string): void {
    if (!plainPassword || typeof plainPassword !== 'string') {
      throw new Error('Password cannot be empty');
    }

    if (plainPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (plainPassword.length > 128) {
      throw new Error('Password is too long');
    }
    if (!/[a-z]/.test(plainPassword)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(plainPassword)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(plainPassword)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(plainPassword)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  public async verify(plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(this.hashedValue, plainPassword);
    } catch (error) {
      return false;
    }
  }

  public getHash(): string {
    return this.hashedValue;
  }
}