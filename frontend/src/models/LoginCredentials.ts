import { ILoginCredentials } from '../types';

export class LoginCredentials implements ILoginCredentials {
  private _email: string;
  private _password: string;

  constructor(email: string, password: string) {
    this._email = email;
    this._password = password;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this._email);
  }

  isPasswordValid(): boolean {
    return this._password.length > 0;
  }

  isValid(): boolean {
    return this.isEmailValid() && this.isPasswordValid();
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.isEmailValid()) {
      errors.push('L\'adresse email n\'est pas valide');
    }

    if (!this.isPasswordValid()) {
      errors.push('Le mot de passe est requis');
    }

    return errors;
  }

  toJSON(): ILoginCredentials {
    return {
      email: this._email,
      password: this._password,
    };
  }
}
