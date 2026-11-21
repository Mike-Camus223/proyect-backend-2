import mongoose from 'mongoose';
import { config } from './env.config.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log('Conectado exitosamente a MongoDB');
  } catch (error) {
    console.error('Advertencia: No se pudo conectar a MongoDB:', error.message);
    console.log('Asegúrate de configurar MONGO_URL en tu archivo .env con una base de datos local o de MongoDB Atlas.');
  }
};

export default connectDB;
