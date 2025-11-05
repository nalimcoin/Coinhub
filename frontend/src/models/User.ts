import { IUser } from '../types';

export class User implements IUser {
  private _id: number;
  private _email: string;
  private _firstName?: string;
  private _lastName?: string;
  private _createdAt?: string;

  constructor(data: IUser) {
    this._id = data.id;
    this._email = data.email;
    this._firstName = data.firstName;
    this._lastName = data.lastName;
    this._createdAt = data.createdAt;
  }

  get id(): number {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get firstName(): string | undefined {
    return this._firstName;
  }

  get lastName(): string | undefined {
    return this._lastName;
  }

  get createdAt(): string | undefined {
    return this._createdAt;
  }

  getFullName(): string {
    if (this._firstName && this._lastName) {
      return `${this._firstName} ${this._lastName}`;
    }
    return this._email;
  }

  toJSON(): IUser {
    return {
      id: this._id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      createdAt: this._createdAt,
    };
  }
}
