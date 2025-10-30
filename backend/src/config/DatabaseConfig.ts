import { Pool, PoolConfig } from 'pg';

export class DatabaseConfig {
  private static instance: Pool;

  public static getPool(): Pool {
    if (!DatabaseConfig.instance) {
      const config: PoolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'coinhub_user',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'coinhub',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };

      DatabaseConfig.instance = new Pool(config);

      DatabaseConfig.instance.on('error', (err) => {
        console.error('[Database] Unexpected error on idle client', err);
        process.exit(-1);
      });

      console.log('[Database] Pool created successfully');
    }

    return DatabaseConfig.instance;
  }

  public static async testConnection(): Promise<boolean> {
    try {
      const pool = DatabaseConfig.getPool();
      const client = await pool.connect();
      
      const result = await client.query('SELECT NOW()');
      console.log('[Database] Connection test successful:', result.rows[0].now);
      
      client.release();
      return true;
    } catch (error) {
      console.error('[Database] Connection test failed:', error);
      return false;
    }
  }

  public static async closePool(): Promise<void> {
    if (DatabaseConfig.instance) {
      await DatabaseConfig.instance.end();
      console.log('[Database] Pool closed');
    }
  }
}