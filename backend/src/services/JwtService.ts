import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn: string = '1h') {
    if (!secret || secret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters long');
    }
    
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  public generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.getId(),
      email: user.getEmail().getValue(),
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      algorithm: 'HS256',
    });
  }

  public verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }
}