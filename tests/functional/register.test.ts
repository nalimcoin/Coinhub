import { NextFunction } from 'express';
import { AuthController } from '../../backend/src/controllers/AuthController';
import { AuthService } from '../../backend/src/services/AuthService';

describe('Register', () => {
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

  it('devrait enregistrer un utilisateur avec succès', async () => {
    mockRequest.body = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    const mockAuthResponse = {
      accessToken: 'jwt.token.here',
      user: {
        id: 1,
        email: 'newuser@example.com',
      },
    };

    mockAuthService.register.mockResolvedValue(mockAuthResponse);

    await authController.register(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.register).toHaveBeenCalledWith(
      'newuser@example.com',
      'Password123!',
      'Jane',
      'Doe'
    );
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Registration successful',
      accessToken: 'jwt.token.here',
      user: {
        id: 1,
        email: 'newuser@example.com',
      },
    });
  });

  it('devrait retourner 400 si email manquant', async () => {
    mockRequest.body = {
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    await authController.register(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Email, password, first name, and last name are required',
    });
  });

  it('devrait retourner 400 si password manquant', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    await authController.register(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('devrait retourner 400 si firstName manquant', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'Password123!',
      lastName: 'Doe',
    };

    await authController.register(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('devrait retourner 400 si lastName manquant', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Jane',
    };

    await authController.register(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('devrait appeler next si email existe déjà', async () => {
    mockRequest.body = {
      email: 'existing@example.com',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    const error = new Error('Email already exists');
    mockAuthService.register.mockRejectedValue(error);

    await authController.register(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockAuthService.register).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('devrait gérer les emails invalides', async () => {
    mockRequest.body = {
      email: 'invalid-email',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    const error = new Error('Invalid email format');
    mockAuthService.register.mockRejectedValue(error);

    await authController.register(
      mockRequest,
      mockResponse,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
