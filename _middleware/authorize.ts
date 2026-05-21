import { expressjwt as jwt } from 'express-jwt';
import config from '../config';
import { db, accounts, refreshTokens } from '../_helpers/db';
import { eq } from 'drizzle-orm';

const { secret } = config;

export default function authorize(roles: any = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({ secret, algorithms: ['HS256'] }),
        async (req: any, res: any, next: any) => {
            const [account] = await db.select().from(accounts)
                .where(eq(accounts.id, req.auth.id));

            if (!account || (roles.length && !roles.includes(account.role))) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const tokens = await db.select().from(refreshTokens)
                .where(eq(refreshTokens.accountId, account.id));

            req.user = req.auth;
            req.user.role = account.role;
            req.user.ownsToken = (token: any) => !!tokens.find((x: any) => x.token === token);

            next();
        }
    ];
}