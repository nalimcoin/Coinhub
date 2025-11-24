import {
    pgTable,
    serial,
    boolean,
    integer,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { accounts } from "./accounts.schema";
import { categories } from "./categories.schema";

export const transactions = pgTable("transactions", {
    transaction_id: serial("transaction_id").primaryKey().notNull(),
    is_income: boolean("is_income").notNull(),
    amount: integer("amount").notNull(),
    description: varchar("description", { length: 255 }),
    date: timestamp("date").notNull(),
    account_id: integer("account_id").references(() => accounts.account_id, { onDelete: "cascade" }).notNull(),
    category_id: integer("category_id").references(() => categories.category_id, { onDelete: "restrict" }).notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
    transaction_id: true,
}).extend({
    is_income: z.boolean({ message: "Le type de transaction (revenu/dépense) est requis." }),

    amount: z.number()
        .int({ message: "Le montant doit être un nombre entier." })
        .positive({ message: "Le montant doit être positif." }),

    description: z.string()
        .max(255, { message: "La description ne peut pas dépasser 255 caractères." })
        .optional(),

    date: z.coerce.date({ message: "La date doit être une date valide." }),

    account_id: z.number()
        .int({ message: "L'ID du compte doit être un nombre entier." })
        .positive({ message: "L'ID du compte doit être positif." }),

    category_id: z.number()
        .int({ message: "L'ID de la catégorie doit être un nombre entier." })
        .positive({ message: "L'ID de la catégorie doit être positif." }),
});

export const selectTransactionSchema = createSelectSchema(transactions);

export const updateTransactionSchema = insertTransactionSchema.partial();

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = z.infer<typeof insertTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;
