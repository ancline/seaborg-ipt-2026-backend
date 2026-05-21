import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import config from '../config';
import { accounts } from '../accounts/account.model';
import { refreshTokens } from '../accounts/refresh-token.model';

const client = createClient({
    url: config.turso.url,
    authToken: config.turso.authToken,
});

export const db = drizzle(client, { schema: { accounts, refreshTokens } });
export { accounts, refreshTokens };