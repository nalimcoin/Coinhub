export interface IUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IAuthResponse {
  message: string;
  accessToken: string;
  user: IUser;
}

export interface IAuthError {
  error: string;
}
