export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email cannot be empty');
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    if (trimmedEmail.length > 254) {
      throw new Error('Email is too long');
    }

    this.value = trimmedEmail;
    Object.freeze(this);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}