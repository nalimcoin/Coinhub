import { Email } from './Email';
import { Password } from './Password';

export class User {
  private readonly id: number;
  private readonly email: Email;
  private readonly password: Password;
  private readonly firstName: string;
  private readonly lastName: string;
  private readonly createdAt: Date;

  constructor(
    id: number,
    email: Email,
    password: Password,
    firstName: string,
    lastName: string,
    createdAt: Date = new Date()
  ) {
    if (!id || id <= 0) {
      throw new Error('Invalid user ID');
    }
    
    if (!firstName?.trim()) {
      throw new Error('First name is required');
    }
    if (!lastName?.trim()) {
      throw new Error('Last name is required');
    }
    
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
    this.createdAt = createdAt;
    
    Object.freeze(this);
  }

  public getId(): number {
    return this.id;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getPassword(): Password {
    return this.password;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return await this.password.verify(plainPassword);
  }

  public toSafeObject(): {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  } {
    return {
      id: this.id,
      email: this.email.getValue(),
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: new Date(this.createdAt),
    };
  }
}