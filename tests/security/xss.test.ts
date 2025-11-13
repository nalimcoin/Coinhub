// @ts-nocheck
import { SanitizationMiddleware } from '../../backend/src/middlewares/SanitizationMiddleware';
import { UserRepository } from '../../backend/src/repositories/UserRepository';
import { AuthService } from '../../backend/src/services/AuthService';
import { UserController } from '../../backend/src/controllers/UserController';
import { Email } from '../../backend/src/models/Email';
import { Password } from '../../backend/src/models/Password';
import { User } from '../../backend/src/models/User';

describe('Tests de Sécurité XSS', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SanitizationMiddleware - Protection XSS', () => {
    it('devrait nettoyer les balises script dans le body', () => {
      mockRequest.body = {
        firstName: '<script>alert("XSS")</script>John',
        lastName: 'Doe',
      };

      SanitizationMiddleware.sanitize(mockRequest, mockResponse, mockNext);

      expect(mockRequest.body.firstName).not.toContain('<script>');
      expect(mockRequest.body.firstName).toContain('&lt;');
      expect(mockNext).toHaveBeenCalled();
    });

    it('devrait nettoyer les balises script dans les paramètres de requête', () => {
      mockRequest.query = {
        search: '<script>alert("XSS")</script>',
      };

      SanitizationMiddleware.sanitize(mockRequest, mockResponse, mockNext);

      expect(mockRequest.query.search).not.toContain('<script>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('devrait nettoyer les balises img avec XSS onerror', () => {
      mockRequest.body = {
        firstName: '<img src=x onerror="alert(1)">John',
        lastName: 'Doe',
      };

      SanitizationMiddleware.sanitize(mockRequest, mockResponse, mockNext);

      expect(mockRequest.body.firstName).not.toContain('onerror');
      expect(mockNext).toHaveBeenCalled();
    });

    it('devrait gérer les valeurs null et undefined', () => {
      mockRequest.body = {
        field1: null,
        field2: undefined,
        field3: 'normal text',
      };

      SanitizationMiddleware.sanitize(mockRequest, mockResponse, mockNext);

      expect(mockRequest.body.field1).toBeNull();
      expect(mockRequest.body.field2).toBeUndefined();
      expect(mockRequest.body.field3).toBe('normal text');
      expect(mockNext).toHaveBeenCalled();
    });

    it('devrait nettoyer les balises iframe', () => {
      mockRequest.body = {
        content: '<iframe src="http://evil.com"></iframe>',
      };

      SanitizationMiddleware.sanitize(mockRequest, mockResponse, mockNext);

      expect(mockRequest.body.content).not.toContain('<iframe');
      expect(mockNext).toHaveBeenCalled();
    });

    it('devrait nettoyer les balises object', () => {
      mockRequest.body = {
        content: '<object data="http://evil.com"></object>',
      };

      SanitizationMiddleware.sanitize(mockRequest, mockResponse, mockNext);

      expect(mockRequest.body.content).not.toContain('<object');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('User Model - Validation des Entrées XSS', () => {
    it('devrait supprimer les espaces des noms pour empêcher les XSS basés sur les espaces', () => {
      const email = new Email('test@example.com');
      const password = Password.createFromHash('$2b$10$hash');

      const user = new User(
        1,
        email,
        password,
        '  John  ',
        '  Doe  ',
        new Date()
      );

      expect(user.getFirstName()).toBe('John');
      expect(user.getLastName()).toBe('Doe');
    });

    it('devrait rejeter un prénom vide après suppression des espaces', () => {
      const email = new Email('test@example.com');
      const password = Password.createFromHash('$2b$10$hash');

      expect(() => {
        new User(1, email, password, '   ', 'Doe', new Date());
      }).toThrow('First name is required');
    });

    it('devrait rejeter un nom vide après suppression des espaces', () => {
      const email = new Email('test@example.com');
      const password = Password.createFromHash('$2b$10$hash');

      expect(() => {
        new User(1, email, password, 'John', '   ', new Date());
      }).toThrow('Last name is required');
    });
  });

  describe('Email Model - Protection XSS', () => {
    it('devrait mettre en minuscule et supprimer les espaces de l\'email', () => {
      const email = new Email('  TEST@EXAMPLE.COM  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('devrait supprimer les espaces et mettre en minuscule l\'email pour empêcher les attaques basées sur la casse', () => {
      const email = new Email('  TeSt@ExAmPlE.CoM  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('devrait rejeter les emails trop longs', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      expect(() => {
        new Email(longEmail);
      }).toThrow('Email is too long');
    });
  });

  describe('UserController - Sécurité des Réponses XSS', () => {
    it('ne devrait pas exposer le mot de passe dans la réponse utilisateur', () => {
      const email = new Email('test@example.com');
      const password = Password.createFromHash('$2b$10$hash');
      const user = new User(1, email, password, 'John', 'Doe', new Date());

      const safeObject = user.toSafeObject();

      expect(safeObject).not.toHaveProperty('password');
      expect(safeObject).toHaveProperty('id');
      expect(safeObject).toHaveProperty('email');
      expect(safeObject).toHaveProperty('firstName');
      expect(safeObject).toHaveProperty('lastName');
    });
  });
});
