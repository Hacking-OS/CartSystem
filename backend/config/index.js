const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const rootEnvPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const toBool = (value, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const config = {
  app: {
    port: parseInt(process.env.PORT || '8080', 10),
    host: process.env.HOST || null,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    name: process.env.DB_NAME || 'CartSystem',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  },
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN || 'demo-access-token',
    refreshSecret: process.env.secretKey || 'demo-refresh-token',
    userRole: process.env.USER || 'user',
    accessTtl: process.env.ACCESS_TOKEN_TTL || '0.01h',
    refreshTtl: process.env.REFRESH_TOKEN_TTL || '0.5h',
  },
  email: {
    service: process.env.SMTP_SERVICE || 'gmail',
    host: process.env.SMTP_HOST || undefined,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: toBool(process.env.SMTP_SECURE, false),
    user: process.env.EMAIL || '',
    pass: process.env.PASSWORD || '',
    from: process.env.EMAIL_FROM || process.env.EMAIL || '',
    rejectUnauthorized: toBool(process.env.SMTP_REJECT_UNAUTHORIZED, false),
  },
  pdf: {
    outputDir: path.resolve(__dirname, '..', 'Generatedpdf'),
    templatePath: path.resolve(__dirname, '..', 'routes', 'report.ejs'),
  },
};

config.email.enabled = Boolean(config.email.user && config.email.pass);

module.exports = config;

