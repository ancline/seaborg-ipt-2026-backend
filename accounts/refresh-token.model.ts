import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { accounts } from './account.model';

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