import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/eventos_db',
  jwtSecret: process.env.JWT_SECRET || 'coderSecretTokenKey2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
};

export default config;
