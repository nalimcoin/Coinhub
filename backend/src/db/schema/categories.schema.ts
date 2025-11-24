import {
    pgTable,
    serial,
    varchar,
    char,
    integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users.schema";

export const categories = pgTable("categories", {
    category_id: serial("category_id").primaryKey().notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }),
    color: char("color", { length: 7 }).notNull(),
    user_id: integer("user_id").references(() => users.user_id, { onDelete: "cascade" }).notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
    category_id: true,
}).extend({
    name: z.string()
        .min(2, { message: "Le nom de la catégorie doit contenir au moins 2 caractères." })
        .max(50, { message: "Le nom de la catégorie ne peut pas dépasser 50 caractères." }),

    description: z.string()
        .max(255, { message: "La description ne peut pas dépasser 255 caractères." })
        .optional(),

    color: z.string()
        .length(7, { message: "La couleur doit être au format hexadécimal #RRGGBB." })
        .regex(/^#[0-9A-Fa-f]{6}$/, { message: "La couleur doit être au format hexadécimal valide (ex: #FF5733)." }),

    user_id: z.number()
        .int({ message: "L'ID utilisateur doit être un nombre entier." })
        .positive({ message: "L'ID utilisateur doit être positif." }),
});

export const selectCategorySchema = createSelectSchema(categories);

export const updateCategorySchema = insertCategorySchema.partial();

export type Category = typeof categories.$inferSelect;
export type NewCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
