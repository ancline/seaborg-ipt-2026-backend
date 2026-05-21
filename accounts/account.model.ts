import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    role: text('role').notNull().default('User'),
    passwordHash: text('password_hash').notNull(),
    acceptTerms: integer('accept_terms', { mode: 'boolean' }),
    verificationToken: text('verification_token'),
    verified: text('verified'),
    resetToken: text('reset_token'),
    resetTokenExpires: text('reset_token_expires'),
    passwordReset: text('password_reset'),
    created: text('created').notNull(),
    updated: text('updated'),
});