import config from '../config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import sendEmail from '../_helpers/send-email';
import { db, accounts, refreshTokens } from '../_helpers/db';
import Role from '../_helpers/role';

export default {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }: any) {
    const [account] = await db.select().from(accounts).where(eq(accounts.email, email));

    if (!account || !account.verified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Email or password is incorrect';
    }

    const jwtToken = generateJwtToken(account);
    const newRefreshToken = generateRefreshTokenData(account, ipAddress);

    await db.insert(refreshTokens).values(newRefreshToken);

    const [inserted] = await db.select().from(refreshTokens)
        .where(eq(refreshTokens.token, newRefreshToken.token));

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: inserted.token
    };
}

async function refreshToken({ token, ipAddress }: any) {
    const [existingToken] = await db.select().from(refreshTokens)
        .where(eq(refreshTokens.token, token));

    if (!existingToken || !isTokenActive(existingToken)) throw 'Invalid token';

    const [account] = await db.select().from(accounts)
        .where(eq(accounts.id, existingToken.accountId));

    const newRefreshToken = generateRefreshTokenData(account, ipAddress);

    await db.update(refreshTokens).set({
        revoked: new Date(),
        revokedByIp: ipAddress,
        replacedByToken: newRefreshToken.token
    }).where(eq(refreshTokens.token, token));

    await db.insert(refreshTokens).values(newRefreshToken);

    const jwtToken = generateJwtToken(account);

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }: any) {
    const [existingToken] = await db.select().from(refreshTokens)
        .where(eq(refreshTokens.token, token));

    if (!existingToken || !isTokenActive(existingToken)) throw 'Invalid token';

    await db.update(refreshTokens).set({
        revoked: new Date(),
        revokedByIp: ipAddress
    }).where(eq(refreshTokens.token, token));
}

async function register(params: any, origin: any) {
    const [existing] = await db.select().from(accounts)
        .where(eq(accounts.email, params.email));

    if (existing) {
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    const allAccounts = await db.select().from(accounts);
    const isFirstAccount = allAccounts.length === 0;

    await db.insert(accounts).values({
    title: params.title,
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    role: isFirstAccount ? Role.Admin : Role.User,
    verificationToken: randomTokenString(),
    passwordHash: await hash(params.password),
    acceptTerms: !!params.acceptTerms,  
    created: new Date()
});

    const [account] = await db.select().from(accounts)
        .where(eq(accounts.email, params.email));

    await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }: any) {
    const [account] = await db.select().from(accounts)
        .where(eq(accounts.verificationToken, token));

    if (!account) throw 'Verification failed';

    await db.update(accounts).set({
        verified: new Date(),
        verificationToken: null
    }).where(eq(accounts.id, account.id));
}

async function forgotPassword({ email }: any, origin: any) {
    const [account] = await db.select().from(accounts)
        .where(eq(accounts.email, email));

    if (!account) return;

    await db.update(accounts).set({
        resetToken: randomTokenString(),
        resetTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }).where(eq(accounts.id, account.id));

    const [updated] = await db.select().from(accounts)
        .where(eq(accounts.id, account.id));

    await sendPasswordResetEmail(updated, origin);
}

async function validateResetToken({ token }: any) {
    const [account] = await db.select().from(accounts).where(
        and(
            eq(accounts.resetToken, token),
            gt(accounts.resetTokenExpires, new Date())
        )
    );

    if (!account) throw 'Invalid token';
    return account;
}

async function resetPassword({ token, password }: any) {
    const account = await validateResetToken({ token });

    await db.update(accounts).set({
        passwordHash: await hash(password),
        passwordReset: new Date(),
        resetToken: null,
        resetTokenExpires: null
    }).where(eq(accounts.id, account.id));
}

async function getAll() {
    const all = await db.select().from(accounts);
    return all.map((x: any) => basicDetails(x));
}

async function getById(id: any) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params: any) {
    const [existing] = await db.select().from(accounts)
        .where(eq(accounts.email, params.email));

    if (existing) throw `Email "${params.email}" is already registered`;

    await db.insert(accounts).values({
        title: params.title,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        role: params.role ?? Role.User,
        passwordHash: await hash(params.password),
        verified: new Date(),
        created: new Date()
        
    });

    const [account] = await db.select().from(accounts)
        .where(eq(accounts.email, params.email));

    return basicDetails(account);
}

async function update(id: any, params: any) {
    const account = await getAccount(id);

    if (params.email && account.email !== params.email) {
        const [taken] = await db.select().from(accounts)
            .where(eq(accounts.email, params.email));
        if (taken) throw `Email "${params.email}" is already taken`;
    }

    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    await db.update(accounts).set({
        ...params,
        updated: new Date()
    }).where(eq(accounts.id, id));

    const [updated] = await db.select().from(accounts)
        .where(eq(accounts.id, id));

    return basicDetails(updated);
}

async function _delete(id: any) {
    await getAccount(id);
    await db.delete(refreshTokens).where(eq(refreshTokens.accountId, id));
    await db.delete(accounts).where(eq(accounts.id, id));
}

// helpers

async function getAccount(id: any) {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    if (!account) throw 'Account not found';
    return account;
}

function isTokenActive(token: any) {
    return !token.revoked && new Date() < new Date(token.expires);
}

function generateRefreshTokenData(account: any, ipAddress: any) {
    return {
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created: new Date(),
        createdByIp: ipAddress,
    };
}

async function hash(password: any) {
    return await bcrypt.hash(password, 10);
}

function generateJwtToken(account: any) {
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account: any) {
    const { id, title, firstName, lastName, email, role, created, updated, verified } = account;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified: !!verified };
}

async function sendVerificationEmail(account: any, origin: any) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email: any, origin: any) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account: any, origin: any) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}