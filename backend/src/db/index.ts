import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "coinhub",
    
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

export const testConnection = async (): Promise<boolean> => {
    try {
        await pool.query("SELECT NOW()");
        console.log("Connexion à la base de données réussie");
        return true;
    } catch (error) {
        console.error("Erreur de connexion à la base de données:", error);
        return false;
    }
};

export const closeConnection = async (): Promise<void> => {
    await pool.end();
    console.log("Connexion à la base de données fermée");
};

process.on("SIGINT", async () => {
    await closeConnection();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await closeConnection();
    process.exit(0);
});