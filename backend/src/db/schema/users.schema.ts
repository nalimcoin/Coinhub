import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
    user_id: serial("user_id").primaryKey().notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password").notNull(),
    first_name: varchar("first_name", { length: 255 }).notNull(),
    last_name: varchar("last_name", { length: 255 }).notNull(),
    creation_date: timestamp("creation_date").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
    user_id: true,
    creation_date: true,
}).extend({
    email: z.string()
        .email({ message: "Format d'email invalide." })
        .min(5, { message: "L'email doit contenir au moins 5 caractères." })
        .max(255, { message: "L'email ne peut pas dépasser 255 caractères." }),
    
    password: z.string()
        .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
        .max(255, { message: "Le mot de passe ne peut pas dépasser 255 caractères." })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
            message: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#)."
        }),
    
    first_name: z.string()
        .min(2, { message: "Le prénom doit contenir au moins 2 caractères." })
        .max(255, { message: "Le prénom ne peut pas dépasser 255 caractères." })
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
            message: "Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets." 
        }),
    
    last_name: z.string()
        .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
        .max(255, { message: "Le nom ne peut pas dépasser 255 caractères." })
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
            message: "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets." 
        }),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email({ message: "Format d'email invalide." })
        .min(1, { message: "L'email est requis." }),
    
    password: z
        .string()
        .min(1, { message: "Le mot de passe est requis." })
        .max(255),
});

const fullSelectUserSchema = createSelectSchema(users);

export const selectUserSchema = fullSelectUserSchema.omit({ password: true });

export const updateUserSchema = insertUserSchema.partial();

export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type UserWithoutPassword = z.infer<typeof selectUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;