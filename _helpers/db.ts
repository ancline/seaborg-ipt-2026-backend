import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import config from '../config';

export const accounts = sqliteTable('accounts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    role: text('role').notNull().default('User'),
    passwordHash: text('password_hash').notNull(),
    verificationToken: text('verification_token'),
    verified: integer('verified', { mode: 'timestamp' }),
    resetToken: text('reset_token'),
    resetTokenExpires: integer('reset_token_expires', { mode: 'timestamp' }),
    passwordReset: integer('password_reset', { mode: 'timestamp' }),
    created: integer('created', { mode: 'timestamp' }).notNull(),
    updated: integer('updated', { mode: 'timestamp' }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const refreshTokens = sqliteTable('refresh_tokens', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id').notNull().references(() => accounts.id),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
    created: integer('created', { mode: 'timestamp' }).notNull(),
    createdByIp: text('created_by_ip'),
    revoked: integer('revoked', { mode: 'timestamp' }),
    revokedByIp: text('revoked_by_ip'),
    replacedByToken: text('replaced_by_token'),
});

const client = createClient({
    url: config.turso.url,
    authToken: config.turso.authToken,
});

export const db = drizzle(client, { schema: { accounts, refreshTokens } });