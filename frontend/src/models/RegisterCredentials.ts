import { IRegisterCredentials } from '../types';

export class RegisterCredentials implements IRegisterCredentials {
  private _email: string;
  private _password: string;
  private _firstName: string;
  private _lastName: string;

  constructor(email: string, password: string, firstName: string, lastName: string) {
    this._email = email;
    this._password = password;
    this._firstName = firstName;
    this._lastName = lastName;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this._email);
  }

  isPasswordValid(): boolean {
    return this._password.length >= 12;
  }

  isFirstNameValid(): boolean {
    return this._firstName.trim().length > 0;
  }

  isLastNameValid(): boolean {
    return this._lastName.trim().length > 0;
  }

  isValid(): boolean {
    return (
      this.isEmailValid() &&
      this.isPasswordValid() &&
      this.isFirstNameValid() &&
      this.isLastNameValid()
    );
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.isEmailValid()) {
      errors.push('L\'adresse email n\'est pas valide');
    }

    if (!this.isPasswordValid()) {
      errors.push('Le mot de passe doit contenir au moins 12 caractères');
    }

    if (!this.isFirstNameValid()) {
      errors.push('Le prénom est requis');
    }

    if (!this.isLastNameValid()) {
      errors.push('Le nom est requis');
    }

    return errors;
  }

  toJSON(): IRegisterCredentials {
    return {
      email: this._email,
      password: this._password,
      firstName: this._firstName,
      lastName: this._lastName,
    };
  }
}
