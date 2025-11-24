import { Pool, PoolClient } from 'pg';
import { Transaction } from '../models/Transaction.js';

export class TransactionRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async create(
    isIncome: boolean,
    amount: number,
    description: string | null,
    date: Date,
    accountId: number,
    categoryId: number
  ): Promise<Transaction> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO transactions (is_income, amount, description, date, account_id, category_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING transaction_id, is_income, amount, description, date, account_id, category_id
      `;

      const result = await client.query(query, [
        isIncome,
        amount,
        description,
        date,
        accountId,
        categoryId
      ]);

      await client.query('COMMIT');

      const row = result.rows[0];

      return new Transaction(
        row.transaction_id,
        row.is_income,
        row.amount,
        row.description,
        new Date(row.date),
        row.account_id,
        row.category_id
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findById(id: number): Promise<Transaction | null> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT transaction_id, is_income, amount, description, date, account_id, category_id FROM transactions WHERE transaction_id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      return new Transaction(
        row.transaction_id,
        row.is_income,
        row.amount,
        row.description,
        new Date(row.date),
        row.account_id,
        row.category_id
      );
    } finally {
      client.release();
    }
  }

  public async findByAccountId(accountId: number): Promise<Transaction[]> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT transaction_id, is_income, amount, description, date, account_id, category_id FROM transactions WHERE account_id = $1 ORDER BY date DESC';
      const result = await client.query(query, [accountId]);

      return result.rows.map(row => new Transaction(
        row.transaction_id,
        row.is_income,
        row.amount,
        row.description,
        new Date(row.date),
        row.account_id,
        row.category_id
      ));
    } finally {
      client.release();
    }
  }

  public async findAll(): Promise<Transaction[]> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT transaction_id, is_income, amount, description, date, account_id, category_id FROM transactions ORDER BY date DESC';
      const result = await client.query(query);

      return result.rows.map(row => new Transaction(
        row.transaction_id,
        row.is_income,
        row.amount,
        row.description,
        new Date(row.date),
        row.account_id,
        row.category_id
      ));
    } finally {
      client.release();
    }
  }

  public async update(id: number, data: { isIncome?: boolean; amount?: number; description?: string | null; date?: Date; categoryId?: number }): Promise<Transaction> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const existingTransaction = await this.findById(id);
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.isIncome !== undefined) {
        updates.push(`is_income = $${paramIndex++}`);
        values.push(data.isIncome);
      }

      if (data.amount !== undefined) {
        updates.push(`amount = $${paramIndex++}`);
        values.push(data.amount);
      }

      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }

      if (data.date !== undefined) {
        updates.push(`date = $${paramIndex++}`);
        values.push(data.date);
      }

      if (data.categoryId !== undefined) {
        updates.push(`category_id = $${paramIndex++}`);
        values.push(data.categoryId);
      }

      if (updates.length === 0) {
        await client.query('COMMIT');
        return existingTransaction;
      }

      values.push(id);
      const query = `
        UPDATE transactions
        SET ${updates.join(', ')}
        WHERE transaction_id = $${paramIndex}
        RETURNING transaction_id, is_income, amount, description, date, account_id, category_id
      `;

      const result = await client.query(query, values);
      await client.query('COMMIT');

      const row = result.rows[0];

      return new Transaction(
        row.transaction_id,
        row.is_income,
        row.amount,
        row.description,
        new Date(row.date),
        row.account_id,
        row.category_id
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

      const existingTransaction = await this.findById(id);
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      const query = 'DELETE FROM transactions WHERE transaction_id = $1';
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
