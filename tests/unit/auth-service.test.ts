import { AuthService } from '../../backend/src/services/AuthService';
import { UserRepository } from '../../backend/src/repositories/UserRepository';
import { JwtService } from '../../backend/src/services/JwtService';
import { User } from '../../backend/src/models/User';
import { Email } from '../../backend/src/models/Email';
import { Password } from '../../backend/src/models/Password';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockJwtService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    } as any;

    authService = new AuthService(mockUserRepository, mockJwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('devrait se connecter avec succès avec des identifiants valides', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';
      const hashedPassword = await Password.createFromPlainText(password);

      const mockUser = new User(
        1,
        new Email(email),
        hashedPassword,
        'John',
        'Doe',
        new Date()
      );

      const mockToken = 'jwt.token.here';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.generateToken.mockResolvedValue(mockToken);

      const result = await authService.login(email, password);

      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: 1,
          email: email,
        },
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(expect.any(Email));
      expect(mockJwtService.generateToken).toHaveBeenCalledWith(mockUser);
    });

    it('devrait lever une erreur quand l\'utilisateur n\'est pas trouvé', async () => {
      const email = 'nonexistent@example.com';
      const password = 'Password123!';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('devrait lever une erreur quand le mot de passe est invalide', async () => {
      const email = 'test@example.com';
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashedPassword = await Password.createFromPlainText(correctPassword);

      const mockUser = new User(
        1,
        new Email(email),
        hashedPassword,
        'John',
        'Doe',
        new Date()
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login(email, wrongPassword)).rejects.toThrow('Invalid credentials');
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('devrait lever "Invalid credentials" pour un format d\'email invalide', async () => {
      const invalidEmail = 'invalid-email';
      const password = 'Password123!';

      await expect(authService.login(invalidEmail, password)).rejects.toThrow();
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de base de données correctement', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';

      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database connection failed'));

      await expect(authService.login(email, password)).rejects.toThrow('Database connection failed');
    });
  });

  describe('register', () => {
    it('devrait enregistrer un nouvel utilisateur avec succès', async () => {
      const email = 'newuser@example.com';
      const password = 'Password123!';
      const firstName = 'Jane';
      const lastName = 'Doe';
      const hashedPassword = await Password.createFromPlainText(password);

      const mockUser = new User(
        1,
        new Email(email),
        hashedPassword,
        firstName,
        lastName,
        new Date()
      );

      const mockToken = 'jwt.token.here';

      mockUserRepository.create.mockResolvedValue(mockUser);
      mockJwtService.generateToken.mockResolvedValue(mockToken);

      const result = await authService.register(email, password, firstName, lastName);

      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: 1,
          email: email,
        },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.any(Email),
        expect.any(Password),
        firstName,
        lastName
      );
      expect(mockJwtService.generateToken).toHaveBeenCalledWith(mockUser);
    });

    it('devrait lever une erreur pour un format d\'email invalide', async () => {
      const invalidEmail = 'invalid-email';
      const password = 'Password123!';
      const firstName = 'Jane';
      const lastName = 'Doe';

      await expect(
        authService.register(invalidEmail, password, firstName, lastName)
      ).rejects.toThrow();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs du repository', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';
      const firstName = 'Jane';
      const lastName = 'Doe';

      mockUserRepository.create.mockRejectedValue(new Error('Email already exists'));

      await expect(
        authService.register(email, password, firstName, lastName)
      ).rejects.toThrow('Email already exists');
      expect(mockJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('devrait créer un hash du mot de passe avant de le stocker', async () => {
      const email = 'newuser@example.com';
      const plainPassword = 'Password123!';
      const firstName = 'Jane';
      const lastName = 'Doe';

      const mockUser = new User(
        1,
        new Email(email),
        await Password.createFromPlainText(plainPassword),
        firstName,
        lastName,
        new Date()
      );

      mockUserRepository.create.mockResolvedValue(mockUser);
      mockJwtService.generateToken.mockResolvedValue('token');

      await authService.register(email, plainPassword, firstName, lastName);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.any(Email),
        expect.objectContaining({
          getHash: expect.any(Function),
        }),
        firstName,
        lastName
      );
    });
  });

  describe('verifyToken', () => {
    it('devrait vérifier le token et retourner l\'utilisateur avec succès', async () => {
      const token = 'valid.jwt.token';
      const mockPayload = { userId: 1 };
      const mockUser = new User(
        1,
        new Email('test@example.com'),
        Password.createFromHash('$2b$10$hash'),
        'John',
        'Doe',
        new Date()
      );

      mockJwtService.verifyToken.mockResolvedValue(mockPayload);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.verifyToken(token);

      expect(result).toBe(mockUser);
      expect(mockJwtService.verifyToken).toHaveBeenCalledWith(token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('devrait lever une erreur quand le token est invalide', async () => {
      const token = 'invalid.jwt.token';

      mockJwtService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      await expect(authService.verifyToken(token)).rejects.toThrow('Invalid token');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('devrait lever une erreur quand l\'utilisateur n\'est pas trouvé', async () => {
      const token = 'valid.jwt.token';
      const mockPayload = { userId: 999 };

      mockJwtService.verifyToken.mockResolvedValue(mockPayload);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.verifyToken(token)).rejects.toThrow('User not found');
    });

    it('devrait gérer un token expiré', async () => {
      const token = 'expired.jwt.token';

      mockJwtService.verifyToken.mockRejectedValue(new Error('Token expired'));

      await expect(authService.verifyToken(token)).rejects.toThrow('Token expired');
    });

    it('devrait vérifier que le payload du token contient userId', async () => {
      const token = 'valid.jwt.token';
      const mockPayload = { userId: 42 };
      const mockUser = new User(
        42,
        new Email('user@example.com'),
        Password.createFromHash('$2b$10$hash'),
        'User',
        'Name',
        new Date()
      );

      mockJwtService.verifyToken.mockResolvedValue(mockPayload);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.verifyToken(token);

      expect(result.getId()).toBe(42);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(42);
    });
  });
});
