import configJson from './config.json';

const config = {
  turso: {
    url: process.env.TURSO_DATABASE_URL || configJson.turso.url,
    authToken: process.env.TURSO_AUTH_TOKEN || configJson.turso.authToken,
  },
  secret: process.env.JWT_SECRET || configJson.secret,
  emailFrom: process.env.EMAIL_FROM || configJson.emailFrom,
  resendApiKey: process.env.RESEND_API_KEY || configJson.resendApiKey,
};

export default config;