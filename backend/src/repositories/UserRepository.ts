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
      const query = 'SELECT user_id, email, password, first_name, last_name, creation_date FROM users WHERE email = $1';
      const result = await client.query(query, [email.getValue()]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const userEmail = new Email(row.email);
      const userPassword = Password.createFromHash(row.password);

      return new User(
        row.user_id,
        userEmail,
        userPassword,
        row.first_name,
        row.last_name,
        new Date(row.creation_date)
      );
    } finally {
      client.release();
    }
  }

  public async create(email: Email, password: Password, firstName: string, lastName: string): Promise<User> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const query = `
        INSERT INTO users (email, password, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, email, password, first_name, last_name, creation_date
      `;

      const result = await client.query(query, [
        email.getValue(),
        password.getHash(),
        firstName,
        lastName
      ]);

      await client.query('COMMIT');

      const row = result.rows[0];

      return new User(
        row.user_id,
        email,
        password,
        row.first_name,
        row.last_name,
        new Date(row.creation_date)
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
      const query = 'SELECT user_id, email, password, first_name, last_name, creation_date FROM users WHERE user_id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      const userEmail = new Email(row.email);
      const userPassword = Password.createFromHash(row.password);

      return new User(
        row.user_id,
        userEmail,
        userPassword,
        row.first_name,
        row.last_name,
        new Date(row.creation_date)
      );
    } finally {
      client.release();
    }
  }

  public async findAll(): Promise<User[]> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT user_id, email, password, first_name, last_name, creation_date FROM users ORDER BY creation_date DESC';
      const result = await client.query(query);

      return result.rows.map(row => {
        const userEmail = new Email(row.email);
        const userPassword = Password.createFromHash(row.password);

        return new User(
          row.user_id,
          userEmail,
          userPassword,
          row.first_name,
          row.last_name,
          new Date(row.creation_date)
        );
      });
    } finally {
      client.release();
    }
  }

  public async update(id: number, data: { email?: Email; password?: Password; firstName?: string; lastName?: string }): Promise<User> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      if (data.email && data.email.getValue() !== existingUser.getEmail().getValue()) {
        const emailExists = await this.findByEmail(data.email);
        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.email) {
        updates.push(`email = $${paramIndex++}`);
        values.push(data.email.getValue());
      }

      if (data.password) {
        updates.push(`password = $${paramIndex++}`);
        values.push(data.password.getHash());
      }

      if (data.firstName) {
        updates.push(`first_name = $${paramIndex++}`);
        values.push(data.firstName);
      }

      if (data.lastName) {
        updates.push(`last_name = $${paramIndex++}`);
        values.push(data.lastName);
      }

      if (updates.length === 0) {
        await client.query('COMMIT');
        return existingUser;
      }

      values.push(id);
      const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE user_id = $${paramIndex}
        RETURNING user_id, email, password, first_name, last_name, creation_date
      `;

      const result = await client.query(query, values);
      await client.query('COMMIT');

      const row = result.rows[0];
      const userEmail = new Email(row.email);
      const userPassword = Password.createFromHash(row.password);

      return new User(
        row.user_id,
        userEmail,
        userPassword,
        row.first_name,
        row.last_name,
        new Date(row.creation_date)
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async delete(id: number): Promise<void> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      const query = 'DELETE FROM users WHERE user_id = $1';
      await client.query(query, [id]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}