import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const runMigrations = async () => {
    console.log("Démarrage des migrations...");

    const pool = new Pool({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "coinhub",
    });

    const db = drizzle(pool);

    try {
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("Migrations exécutées avec succès");
    } catch (error) {
        console.error("Erreur lors de l'exécution des migrations:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

runMigrations();