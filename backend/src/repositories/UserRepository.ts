import { Pool, PoolClient } from 'pg';
import { User } from '../models/User';
import { Email } from '../models/Email';
import { Password } from '../models/Password';

export class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async findByEmail(email: Email): Promise<User | null> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      const query = 'SELECT id, email, password_hash, created_at FROM users WHERE email = $1';
      const result = await client.query(query, [email.getValue()]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const userEmail = new Email(row.email);
      const userPassword = Password.createFromHash(row.password_hash);
      
      return new User(
        row.id,
        userEmail,
        userPassword,
        new Date(row.created_at)
      );
    } finally {
      client.release();
    }
  }

  public async create(email: Email, password: Password): Promise<User> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const query = `
        INSERT INTO users (email, password_hash, created_at)
        VALUES ($1, $2, NOW())
        RETURNING id, email, password_hash, created_at
      `;
      
      const result = await client.query(query, [
        email.getValue(),
        password.getHash()
      ]);

      await client.query('COMMIT');

      const row = result.rows[0];
      
      return new User(
        row.id,
        email,
        password,
        new Date(row.created_at)
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findById(id: number): Promise<User | null> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      const query = 'SELECT id, email, password_hash, created_at FROM users WHERE id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      const userEmail = new Email(row.email);
      const userPassword = Password.createFromHash(row.password_hash);
      
      return new User(
        row.id,
        userEmail,
        userPassword,
        new Date(row.created_at)
      );
    } finally {
      client.release();
    }
  }
}