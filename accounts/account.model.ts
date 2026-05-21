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
    verified: integer('verified', { mode: 'timestamp' }),
    resetToken: text('reset_token'),
    resetTokenExpires: integer('reset_token_expires', { mode: 'timestamp' }),
    passwordReset: integer('password_reset', { mode: 'timestamp' }),
    created: integer('created', { mode: 'timestamp' }).notNull(),
    updated: integer('updated', { mode: 'timestamp' }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});