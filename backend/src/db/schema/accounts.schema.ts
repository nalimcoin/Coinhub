import {
    pgTable,
    serial,
    varchar,
    integer,
    char,
    timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users.schema";

export const accounts = pgTable("accounts", {
    account_id: serial("account_id").primaryKey().notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    initial_balance: integer("initial_balance").notNull(),
    actual_balance: integer("actual_balance").notNull(),
    currency: char("currency", { length: 3 }).notNull(),
    creation_date: timestamp("creation_date").defaultNow().notNull(),
    user_id: integer("user_id").references(() => users.user_id, { onDelete: "cascade" }).notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
    account_id: true,
    creation_date: true,
    actual_balance: true,
}).extend({
    name: z.string()
        .min(5, { message: "Le nom du compte doit contenir au moins 5 caractères." })
        .max(50, { message: "Le nom du compte ne peut pas dépasser 50 caractères." }),

    initial_balance: z.number()
        .int({ message: "Le solde initial doit être un nombre entier." }),

    currency: z.string()
        .length(3, { message: "La devise doit être un code à 3 lettres." })
        .regex(/^[A-Z]{3}$/, { message: "La devise doit être en majuscules (ex: EUR, USD)." }),

    user_id: z.number()
        .int({ message: "L'ID utilisateur doit être un nombre entier." })
        .positive({ message: "L'ID utilisateur doit être positif." }),
});

export const selectAccountSchema = createSelectSchema(accounts);

export const updateAccountSchema = insertAccountSchema.partial().extend({
    actual_balance: z.number()
        .int({ message: "Le solde actuel doit être un nombre entier." })
        .optional(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = z.infer<typeof insertAccountSchema>;
export type UpdateAccount = z.infer<typeof updateAccountSchema>;
