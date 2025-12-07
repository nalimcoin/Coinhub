import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { User } from '../models/User';

export interface JwtPayload extends JWTPayload {
  userId: number;
}

export class JwtService {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;

  constructor(secret: string, expiresIn: string = '15m') {
    if (!secret || secret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters long');
    }

    this.secret = new TextEncoder().encode(secret);
    this.expiresIn = expiresIn;
  }

  public async generateToken(user: User): Promise<string> {
    const token = await new SignJWT({ userId: user.getId() })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);

    return token;
  }

  public async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: ['HS256'],
      });

      if (!payload.userId || typeof payload.userId !== 'number') {
        throw new Error('Invalid token payload');
      }

      return payload as JwtPayload;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new Error('Token has expired');
        } else if (error.message.includes('invalid')) {
          throw new Error('Invalid token');
        }
      }
      throw new Error('Token verification failed');
    }
  }
}