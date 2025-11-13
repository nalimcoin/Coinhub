// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../backend/src/controllers/UserController';
import { UserRepository } from '../../backend/src/repositories/UserRepository';
import { User } from '../../backend/src/models/User';
import { Email } from '../../backend/src/models/Email';
import { Password } from '../../backend/src/models/Password';
import { AuthenticatedRequest } from '../../backend/src/middlewares/AuthMiddleware';

describe('UserController', () => {
  let userController: UserController;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRequest: Partial<Request>;
  let mockAuthRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    userController = new UserController(mockUserRepository);

    mockRequest = {
      params: {},
      body: {},
    };

    mockAuthRequest = {
      params: {},
      body: {},
      user: { userId: 1 },
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

  describe('getAll', () => {
    it('devrait retourner tous les utilisateurs avec succès', async () => {
      const mockUsers = [
        new User(
          1,
          new Email('user1@example.com'),
          Password.createFromHash('$2b$10$hash1'),
          'John',
          'Doe',
          new Date()
        ),
        new User(
          2,
          new Email('user2@example.com'),
          Password.createFromHash('$2b$10$hash2'),
          'Jane',
          'Smith',
          new Date()
        ),
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      await userController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Users retrieved successfully',
        users: mockUsers.map(user => user.toSafeObject()),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait appeler next avec une erreur en cas d\'échec', async () => {
      const error = new Error('Database error');
      mockUserRepository.findAll.mockRejectedValue(error);

      await userController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('devrait retourner un utilisateur par id avec succès', async () => {
      const mockUser = new User(
        1,
        new Email('test@example.com'),
        Password.createFromHash('$2b$10$hash'),
        'John',
        'Doe',
        new Date()
      );

      mockRequest.params = { id: '1' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User retrieved successfully',
        user: mockUser.toSafeObject(),
      });
    });

    it('devrait retourner 400 pour un id utilisateur invalide', async () => {
      mockRequest.params = { id: 'invalid' };

      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('devrait retourner 404 quand l\'utilisateur n\'est pas trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockUserRepository.findById.mockResolvedValue(null);

      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('getCurrent', () => {
    it('devrait retourner l\'utilisateur actuel avec succès', async () => {
      const mockUser = new User(
        1,
        new Email('test@example.com'),
        Password.createFromHash('$2b$10$hash'),
        'John',
        'Doe',
        new Date()
      );

      mockAuthRequest.user = { userId: 1 };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await userController.getCurrent(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Current user retrieved successfully',
        user: mockUser.toSafeObject(),
      });
    });

    it('devrait retourner 401 quand l\'utilisateur n\'est pas authentifié', async () => {
      mockAuthRequest.user = undefined;

      await userController.getCurrent(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('devrait retourner 404 quand l\'utilisateur n\'est pas trouvé', async () => {
      mockAuthRequest.user = { userId: 999 };
      mockUserRepository.findById.mockResolvedValue(null);

      await userController.getCurrent(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('update', () => {
    it('devrait mettre à jour l\'utilisateur avec succès', async () => {
      const mockUser = new User(
        1,
        new Email('updated@example.com'),
        Password.createFromHash('$2b$10$newhash'),
        'Updated',
        'Name',
        new Date()
      );

      mockAuthRequest.user = { userId: 1 };
      mockAuthRequest.params = { id: '1' };
      mockAuthRequest.body = {
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'Name',
      };

      mockUserRepository.update.mockResolvedValue(mockUser);

      await userController.update(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        email: expect.any(Email),
        firstName: 'Updated',
        lastName: 'Name',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User updated successfully',
        user: mockUser.toSafeObject(),
      });
    });

    it('devrait retourner 401 quand l\'utilisateur n\'est pas authentifié', async () => {
      mockAuthRequest.user = undefined;
      mockAuthRequest.params = { id: '1' };

      await userController.update(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('devrait retourner 400 pour un id utilisateur invalide', async () => {
      mockAuthRequest.user = { userId: 1 };
      mockAuthRequest.params = { id: 'invalid' };

      await userController.update(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });
  });

  describe('delete', () => {
    it('devrait supprimer l\'utilisateur avec succès', async () => {
      mockAuthRequest.user = { userId: 1 };
      mockAuthRequest.params = { id: '1' };

      mockUserRepository.delete.mockResolvedValue(undefined);

      await userController.delete(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('devrait retourner 401 quand l\'utilisateur n\'est pas authentifié', async () => {
      mockAuthRequest.user = undefined;
      mockAuthRequest.params = { id: '1' };

      await userController.delete(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('devrait retourner 400 pour un id utilisateur invalide', async () => {
      mockAuthRequest.user = { userId: 1 };
      mockAuthRequest.params = { id: 'invalid' };

      await userController.delete(
        mockAuthRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });
  });
});
