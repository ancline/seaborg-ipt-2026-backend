import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { accounts } from './account.model';

export const refreshTokens = sqliteTable('refresh_tokens', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: integer('account_id').notNull().references(() => accounts.id),
    token: text('token').notNull(),
    expires: text('expires').notNull(),
    created: text('created').notNull(),
    createdByIp: text('created_by_ip'),
    revoked: text('revoked'),
    revokedByIp: text('revoked_by_ip'),
    replacedByToken: text('replaced_by_token'),
});