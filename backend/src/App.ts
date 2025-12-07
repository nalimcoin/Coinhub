import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { DatabaseConfig } from './config/DatabaseConfig';
import { UserRepository } from './repositories/UserRepository';
import { AccountRepository } from './repositories/AccountRepository';
import { CategoryRepository } from './repositories/CategoryRepository';
import { TransactionRepository } from './repositories/TransactionRepository';
import { JwtService } from './services/JwtService';
import { AuthService } from './services/AuthService';
import { AccountService } from './services/AccountService';
import { CategoryService } from './services/CategoryService';
import { DefaultCategoryService } from './services/DefaultCategoryService';
import { TransactionService } from './services/TransactionService';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { AccountController } from './controllers/AccountController';
import { CategoryController } from './controllers/CategoryController';
import { TransactionController } from './controllers/TransactionController';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';
import { SanitizationMiddleware } from './middlewares/SanitizationMiddleware';
import { AuthRoutes } from './routes/AuthRoutes';
import { UserRoutes } from './routes/UserRoutes';
import { AccountRoutes } from './routes/AccountRoutes';
import { CategoryRoutes } from './routes/CategoryRoutes';
import { TransactionRoutes } from './routes/TransactionRoutes';

export class App {
  private app: Application;
  private pool: Pool;
  private port: number;

  constructor() {
    dotenv.config();

    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    this.pool = DatabaseConfig.getPool();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      })
    );

    const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:3000';
    this.app.use(
      cors({
        origin: frontendUrl,
        credentials: false,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 600,
      })
    );

    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    this.app.use(SanitizationMiddleware.sanitize);

    if (process.env.NODE_ENV === 'development') {
      this.app.use((req: Request, _res: Response, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
      });
    }
  }

  private configureRoutes(): void {
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    const userRepository = new UserRepository(this.pool);
    const accountRepository = new AccountRepository(this.pool);
    const categoryRepository = new CategoryRepository(this.pool);
    const transactionRepository = new TransactionRepository(this.pool);
    const jwtService = new JwtService(
      process.env.JWT_SECRET || ''
    );
    const defaultCategoryService = new DefaultCategoryService(categoryRepository);
    const authService = new AuthService(userRepository, jwtService, defaultCategoryService);
    const accountService = new AccountService(accountRepository);
    const categoryService = new CategoryService(categoryRepository);
    const transactionService = new TransactionService(transactionRepository, categoryRepository, accountService);
    const authController = new AuthController(authService);
    const userController = new UserController(userRepository);
    const accountController = new AccountController(accountService);
    const categoryController = new CategoryController(categoryService);
    const transactionController = new TransactionController(transactionService, accountService);
    const authMiddleware = new AuthMiddleware(jwtService);

    const authRoutes = new AuthRoutes(authController, authMiddleware);
    const userRoutes = new UserRoutes(userController, authMiddleware);
    const accountRoutes = new AccountRoutes(accountController, authMiddleware);
    const categoryRoutes = new CategoryRoutes(categoryController, authMiddleware);
    const transactionRoutes = new TransactionRoutes(transactionController, authMiddleware);

    this.app.use('/api/auth', authRoutes.getRouter());
    this.app.use('/api/users', userRoutes.getRouter());
    this.app.use('/api/accounts', accountRoutes.getRouter());
    this.app.use('/api/categories', categoryRoutes.getRouter());
    this.app.use('/api/transactions', transactionRoutes.getRouter());
  }

  private configureErrorHandling(): void {
    this.app.use(ErrorMiddleware.notFound);
    this.app.use(ErrorMiddleware.handle);
  }

  public async start(): Promise<void> {
    try {
      const isDbConnected = await DatabaseConfig.testConnection();
      if (!isDbConnected) {
        throw new Error('Database connection failed');
      }

      this.app.listen(this.port, () => {
        console.log(`[Server] Running on port ${this.port}`);
        console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`[Server] Frontend URL: ${process.env.FRONTEND_URL || 'https://localhost:3000'}`);
      });
    } catch (error) {
      console.error('[Server] Failed to start:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    await DatabaseConfig.closePool();
    console.log('[Server] Stopped');
  }

  public getApp(): Application {
    return this.app;
  }
}