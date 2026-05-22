import configJson from './config.json';

const config = {
  database: {
    host: process.env.DB_HOST || configJson.database.host,
    port: Number(process.env.DB_PORT) || configJson.database.port,
    user: process.env.DB_USER || configJson.database.user,
    password: process.env.DB_PASSWORD || configJson.database.password,
    database: process.env.DB_NAME || configJson.database.database,
  },
  secret: process.env.JWT_SECRET || configJson.secret,
  emailFrom: process.env.EMAIL_FROM || configJson.emailFrom,
  resendApiKey: process.env.RESEND_API_KEY || configJson.resendApiKey,
};

export default config;