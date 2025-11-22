import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const runMigrations = async () => {
    console.log("Démarrage des migrations...");

    if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
        console.error("Erreur: Les variables d'environnement doivent être définies");
        process.exit(1);
    }

    const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
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