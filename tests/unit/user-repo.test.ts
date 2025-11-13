// @ts-nocheck
import { Pool, PoolClient } from 'pg';
import { UserRepository } from '../../backend/src/repositories/UserRepository';
import { User } from '../../backend/src/models/User';
import { Email } from '../../backend/src/models/Email';
import { Password } from '../../backend/src/models/Password';

describe('UserRepository', () => {
  let mockPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<PoolClient>;
  let userRepository: UserRepository;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    } as any;

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    } as any;

    userRepository = new UserRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('devrait retourner un utilisateur quand l\'email existe', async () => {
      const email = new Email('test@example.com');
      const mockRow = {
        user_id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        first_name: 'John',
        last_name: 'Doe',
        creation_date: new Date('2024-01-01'),
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [mockRow],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      const result = await userRepository.findByEmail(email);

      expect(result).toBeInstanceOf(User);
      expect(result?.getId()).toBe(1);
      expect(result?.getEmail().getValue()).toBe('test@example.com');
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT user_id, email, password, first_name, last_name, creation_date FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('devrait retourner null quand l\'email n\'existe pas', async () => {
      const email = new Email('nonexistent@example.com');
      mockClient.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      } as any);

      const result = await userRepository.findByEmail(email);

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('devrait retourner un utilisateur quand l\'id existe', async () => {
      const mockRow = {
        user_id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        first_name: 'John',
        last_name: 'Doe',
        creation_date: new Date('2024-01-01'),
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [mockRow],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      } as any);

      const result = await userRepository.findById(1);

      expect(result).toBeInstanceOf(User);
      expect(result?.getId()).toBe(1);
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT user_id, email, password, first_name, last_name, creation_date FROM users WHERE user_id = $1',
        [1]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('devrait retourner null quand l\'id n\'existe pas', async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      } as any);

      const result = await userRepository.findById(999);

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('devrait retourner tous les utilisateurs', async () => {
      const mockRows = [
        {
          user_id: 1,
          email: 'user1@example.com',
          password: '$2b$10$hash1',
          first_name: 'John',
          last_name: 'Doe',
          creation_date: new Date('2024-01-01'),
        },
        {
          user_id: 2,
          email: 'user2@example.com',
          password: '$2b$10$hash2',
          first_name: 'Jane',
          last_name: 'Smith',
          creation_date: new Date('2024-01-02'),
        },
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: mockRows,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: [],
      } as any);

      const result = await userRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0].getId()).toBe(1);
      expect(result[1].getId()).toBe(2);
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT user_id, email, password, first_name, last_name, creation_date FROM users ORDER BY creation_date DESC'
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('devrait retourner un tableau vide quand aucun utilisateur n\'existe', async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      } as any);

      const result = await userRepository.findAll();

      expect(result).toEqual([]);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const email = new Email('newuser@example.com');
      const password = await Password.createFromPlainText('Password123!');
      const mockRow = {
        user_id: 1,
        email: 'newuser@example.com',
        password: password.getHash(),
        first_name: 'New',
        last_name: 'User',
        creation_date: new Date('2024-01-01'),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ command: 'BEGIN', rowCount: 0, oid: 0, fields: [], rows: [] } as any)
        .mockResolvedValueOnce({ rows: [mockRow], command: 'INSERT', rowCount: 1, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ command: 'COMMIT', rowCount: 0, oid: 0, fields: [], rows: [] } as any);

      const result = await userRepository.create(email, password, 'New', 'User');

      expect(result).toBeInstanceOf(User);
      expect(result.getId()).toBe(1);
      expect(result.getEmail().getValue()).toBe('newuser@example.com');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      const email = new Email('existing@example.com');
      const password = await Password.createFromPlainText('Password123!');

      mockClient.query
        .mockResolvedValueOnce({ command: 'BEGIN', rowCount: 0, oid: 0, fields: [], rows: [] } as any)
        .mockResolvedValueOnce({
          rows: [{
            user_id: 1,
            email: 'existing@example.com',
            password: password.getHash(),
            first_name: 'Existing',
            last_name: 'User',
            creation_date: new Date(),
          }],
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
        } as any)
        .mockResolvedValueOnce({ command: 'ROLLBACK', rowCount: 0, oid: 0, fields: [], rows: [] } as any);

      await expect(
        userRepository.create(email, password, 'New', 'User')
      ).rejects.toThrow('Email already exists');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un utilisateur avec succès', async () => {
      const newEmail = new Email('updated@example.com');
      const mockExistingRow = {
        user_id: 1,
        email: 'old@example.com',
        password: '$2b$10$oldhash',
        first_name: 'Old',
        last_name: 'Name',
        creation_date: new Date('2024-01-01'),
      };
      const mockUpdatedRow = {
        user_id: 1,
        email: 'updated@example.com',
        password: '$2b$10$oldhash',
        first_name: 'Updated',
        last_name: 'Name',
        creation_date: new Date('2024-01-01'),
      };

      mockClient.query
        .mockResolvedValueOnce({ command: 'BEGIN', rowCount: 0, oid: 0, fields: [], rows: [] } as any)
        .mockResolvedValueOnce({ rows: [mockExistingRow], command: 'SELECT', rowCount: 1, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ rows: [mockUpdatedRow], command: 'UPDATE', rowCount: 1, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ command: 'COMMIT', rowCount: 0, oid: 0, fields: [], rows: [] } as any);

      const result = await userRepository.update(1, { email: newEmail, firstName: 'Updated' });

      expect(result).toBeInstanceOf(User);
      expect(result.getEmail().getValue()).toBe('updated@example.com');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('devrait retourner une erreur si l\'utilisateur n\'est pas trouvé', async () => {
      mockClient.query
        .mockResolvedValueOnce({ command: 'BEGIN', rowCount: 0, oid: 0, fields: [], rows: [] } as any)
        .mockResolvedValueOnce({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ command: 'ROLLBACK', rowCount: 0, oid: 0, fields: [], rows: [] } as any);

      await expect(
        userRepository.update(999, { firstName: 'Updated' })
      ).rejects.toThrow('User not found');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('devrait supprimer un utilisateur avec succès', async () => {
      const mockRow = {
        user_id: 1,
        email: 'test@example.com',
        password: '$2b$10$hash',
        first_name: 'User',
        last_name: 'Name',
        creation_date: new Date('2024-01-01'),
      };

      mockClient.query
        .mockResolvedValueOnce({ command: 'BEGIN', rowCount: 0, oid: 0, fields: [], rows: [] } as any)
        .mockResolvedValueOnce({ rows: [mockRow], command: 'SELECT', rowCount: 1, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ command: 'DELETE', rowCount: 1, oid: 0, fields: [], rows: [] } as any)
        .mockResolvedValueOnce({ command: 'COMMIT', rowCount: 0, oid: 0, fields: [], rows: [] } as any);

      await userRepository.delete(1);

      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM users WHERE user_id = $1', [1]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('devrait retourner une erreur si l\'utilisateur n\'est pas trouvé', async () => {
      mockClient.query
        .mockResolvedValueOnce({ command: 'BEGIN', rowCount: 0, oid: 0, fields: [], rows: [] } as any)
        .mockResolvedValueOnce({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any)
        .mockResolvedValueOnce({ command: 'ROLLBACK', rowCount: 0, oid: 0, fields: [], rows: [] } as any);

      await expect(userRepository.delete(999)).rejects.toThrow('User not found');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
