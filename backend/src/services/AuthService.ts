import { UserRepository } from '../repositories/UserRepository';
import { JwtService } from './JwtService';
import { DefaultCategoryService } from './DefaultCategoryService';
import { Email } from '../models/Email';
import { Password } from '../models/Password';
import { User } from '../models/User';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
  };
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtService: JwtService;
  private defaultCategoryService: DefaultCategoryService;

  constructor(userRepository: UserRepository, jwtService: JwtService, defaultCategoryService: DefaultCategoryService) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.defaultCategoryService = defaultCategoryService;
  }

  public async login(emailStr: string, passwordStr: string): Promise<AuthResponse> {
    try {
      const email = new Email(emailStr);
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new Error('Invalid credentials');
      }
      const isPasswordValid = await user.verifyPassword(passwordStr);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      const accessToken = await this.jwtService.generateToken(user);

      return {
        accessToken,
        user: {
          id: user.getId(),
          email: user.getEmail().getValue(),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message !== 'Invalid credentials') {
        throw error;
      }
      throw new Error('Invalid credentials');
    }
  }

  public async register(emailStr: string, passwordStr: string, firstName: string, lastName: string): Promise<AuthResponse> {
    const email = new Email(emailStr);
    const password = await Password.createFromPlainText(passwordStr);
    const user = await this.userRepository.create(email, password, firstName, lastName);

    await this.defaultCategoryService.createDefaultCategoriesForUser(user.getId());

    const accessToken = await this.jwtService.generateToken(user);

    return {
      accessToken,
      user: {
        id: user.getId(),
        email: user.getEmail().getValue(),
      },
    };
  }

  public async verifyToken(token: string): Promise<User> {
    const payload = await this.jwtService.verifyToken(token);
    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}