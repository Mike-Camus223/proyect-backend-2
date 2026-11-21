import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
};

if (!config.jwtSecret) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

export default config;
