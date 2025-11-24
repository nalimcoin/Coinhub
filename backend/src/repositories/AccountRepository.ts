import { Pool, PoolClient } from 'pg';
import { Account } from '../models/Account.js';
import { AccountName } from '../models/AccountName.js';
import { Currency } from '../models/Currency.js';

export class AccountRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async create(name: AccountName, initialBalance: number, currency: Currency, userId: number): Promise<Account> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO accounts (name, initial_balance, actual_balance, currency, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING account_id, name, initial_balance, actual_balance, currency, creation_date, user_id
      `;

      const result = await client.query(query, [
        name.getValue(),
        initialBalance,
        initialBalance,
        currency.getValue(),
        userId
      ]);

      await client.query('COMMIT');

      const row = result.rows[0];

      return new Account(
        row.account_id,
        new AccountName(row.name),
        row.initial_balance,
        row.actual_balance,
        new Currency(row.currency),
        new Date(row.creation_date),
        row.user_id
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findById(id: number): Promise<Account | null> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT account_id, name, initial_balance, actual_balance, currency, creation_date, user_id FROM accounts WHERE account_id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      return new Account(
        row.account_id,
        new AccountName(row.name),
        row.initial_balance,
        row.actual_balance,
        new Currency(row.currency),
        new Date(row.creation_date),
        row.user_id
      );
    } finally {
      client.release();
    }
  }

  public async findByUserId(userId: number): Promise<Account[]> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT account_id, name, initial_balance, actual_balance, currency, creation_date, user_id FROM accounts WHERE user_id = $1 ORDER BY creation_date DESC';
      const result = await client.query(query, [userId]);

      return result.rows.map(row => new Account(
        row.account_id,
        new AccountName(row.name),
        row.initial_balance,
        row.actual_balance,
        new Currency(row.currency),
        new Date(row.creation_date),
        row.user_id
      ));
    } finally {
      client.release();
    }
  }

  public async findAll(): Promise<Account[]> {
    const client: PoolClient = await this.pool.connect();

    try {
      const query = 'SELECT account_id, name, initial_balance, actual_balance, currency, creation_date, user_id FROM accounts ORDER BY creation_date DESC';
      const result = await client.query(query);

      return result.rows.map(row => new Account(
        row.account_id,
        new AccountName(row.name),
        row.initial_balance,
        row.actual_balance,
        new Currency(row.currency),
        new Date(row.creation_date),
        row.user_id
      ));
    } finally {
      client.release();
    }
  }

  public async update(id: number, data: { name?: AccountName; initialBalance?: number; actualBalance?: number; currency?: Currency }): Promise<Account> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const existingAccount = await this.findById(id);
      if (!existingAccount) {
        throw new Error('Account not found');
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.name) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name.getValue());
      }

      if (data.initialBalance !== undefined) {
        updates.push(`initial_balance = $${paramIndex++}`);
        values.push(data.initialBalance);
      }

      if (data.actualBalance !== undefined) {
        updates.push(`actual_balance = $${paramIndex++}`);
        values.push(data.actualBalance);
      }

      if (data.currency) {
        updates.push(`currency = $${paramIndex++}`);
        values.push(data.currency.getValue());
      }

      if (updates.length === 0) {
        await client.query('COMMIT');
        return existingAccount;
      }

      values.push(id);
      const query = `
        UPDATE accounts
        SET ${updates.join(', ')}
        WHERE account_id = $${paramIndex}
        RETURNING account_id, name, initial_balance, actual_balance, currency, creation_date, user_id
      `;

      const result = await client.query(query, values);
      await client.query('COMMIT');

      const row = result.rows[0];

      return new Account(
        row.account_id,
        new AccountName(row.name),
        row.initial_balance,
        row.actual_balance,
        new Currency(row.currency),
        new Date(row.creation_date),
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

      const existingAccount = await this.findById(id);
      if (!existingAccount) {
        throw new Error('Account not found');
      }

      const query = 'DELETE FROM accounts WHERE account_id = $1';
      await client.query(query, [id]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async updateBalance(id: number, newBalance: number): Promise<Account> {
    return this.update(id, { actualBalance: newBalance });
  }

  public async calculateBalance(accountId: number): Promise<number> {
    const client: PoolClient = await this.pool.connect();

    try {
      // Get initial balance
      const accountQuery = 'SELECT initial_balance FROM accounts WHERE account_id = $1';
      const accountResult = await client.query(accountQuery, [accountId]);

      if (accountResult.rows.length === 0) {
        throw new Error('Account not found');
      }

      const initialBalance = accountResult.rows[0].initial_balance;

      // Calculate sum of all transactions
      const transactionQuery = `
        SELECT
          COALESCE(SUM(CASE WHEN is_income = true THEN amount ELSE -amount END), 0) as total
        FROM transactions
        WHERE account_id = $1
      `;
      const transactionResult = await client.query(transactionQuery, [accountId]);

      const transactionTotal = parseInt(transactionResult.rows[0].total);

      return initialBalance + transactionTotal;
    } finally {
      client.release();
    }
  }
}
