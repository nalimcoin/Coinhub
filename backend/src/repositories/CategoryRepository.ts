import { Pool, PoolClient } from 'pg';
import { Category } from '../models/Category.js';
import { CategoryName } from '../models/CategoryName.js';
import { Color } from '../models/Color.js';

export class CategoryRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async create(name: CategoryName, description: string | null, color: Color, userId: number): Promise<Category> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO categories (name, description, color, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING category_id, name, description, color, user_id
      `;

      const result = await client.query(query, [
        name.getValue(),
        description,
        color.getValue(),
        userId
      ]);

      await client.query('COMMIT');

      const row = result.rows[0];

      return new Category(
        row.category_id,
        new CategoryName(row.name),
        row.description,
        new Color(row.color),
        row.user_id
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findById(id: number): Promise<Category | null> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT category_id, name, description, color, user_id FROM categories WHERE category_id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      return new Category(
        row.category_id,
        new CategoryName(row.name),
        row.description,
        new Color(row.color),
        row.user_id
      );
    } finally {
      client.release();
    }
  }

  public async findAll(): Promise<Category[]> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT category_id, name, description, color, user_id FROM categories ORDER BY name ASC';
      const result = await client.query(query);

      return result.rows.map(row => new Category(
        row.category_id,
        new CategoryName(row.name),
        row.description,
        new Color(row.color),
        row.user_id
      ));
    } finally {
      client.release();
    }
  }

  public async findByUserId(userId: number): Promise<Category[]> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT category_id, name, description, color, user_id FROM categories WHERE user_id = $1 ORDER BY name ASC';
      const result = await client.query(query, [userId]);

      return result.rows.map(row => new Category(
        row.category_id,
        new CategoryName(row.name),
        row.description,
        new Color(row.color),
        row.user_id
      ));
    } finally {
      client.release();
    }
  }

  public async update(id: number, data: { name?: CategoryName; description?: string | null; color?: Color }): Promise<Category> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const existingCategory = await this.findById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.name) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name.getValue());
      }

      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }

      if (data.color) {
        updates.push(`color = $${paramIndex++}`);
        values.push(data.color.getValue());
      }

      if (updates.length === 0) {
        await client.query('COMMIT');
        return existingCategory;
      }

      values.push(id);
      const query = `
        UPDATE categories
        SET ${updates.join(', ')}
        WHERE category_id = $${paramIndex}
        RETURNING category_id, name, description, color, user_id
      `;

      const result = await client.query(query, values);
      await client.query('COMMIT');

      const row = result.rows[0];

      return new Category(
        row.category_id,
        new CategoryName(row.name),
        row.description,
        new Color(row.color),
        row.user_id
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

      const existingCategory = await this.findById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      const query = 'DELETE FROM categories WHERE category_id = $1';
      await client.query(query, [id]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async isUsedInTransactions(id: number): Promise<boolean> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT COUNT(*) as count FROM transactions WHERE category_id = $1';
      const result = await client.query(query, [id]);

      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }
}
