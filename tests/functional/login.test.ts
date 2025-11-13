import { NextFunction } from 'express';
import { AuthController } from '../../backend/src/controllers/AuthController';
import { AuthService } from '../../backend/src/services/AuthService';

describe('Login', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      verifyToken: jest.fn(),
    } as any;

    authController = new AuthController(mockAuthService);

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait se connecter avec succès', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockAuthResponse = {
      accessToken: 'jwt.token.here',
      user: {
        id: 1,
        email: 'test@example.com',
      },
    };

    mockAuthService.login.mockResolvedValue(mockAuthResponse);

    await authController.login(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'Password123!');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Login successful',
      accessToken: 'jwt.token.here',
      user: {
        id: 1,
        email: 'test@example.com',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait retourner 400 si email manquant', async () => {
    mockRequest.body = {
      password: 'Password123!',
    };

    await authController.login(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Email and password are required',
    });
  });

  it('devrait retourner 400 si password manquant', async () => {
    mockRequest.body = {
      email: 'test@example.com',
    };

    await authController.login(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Email and password are required',
    });
  });

  it('devrait gérer les erreurs de base de données', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const error = new Error('Database error');
    mockAuthService.login.mockRejectedValue(error);

    await authController.login(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
