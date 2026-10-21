import app from './app.js';
import mongoose from 'mongoose';
import { config } from './config/env.config.js';

const PORT = config.port;

mongoose.connect(config.mongoUrl)
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch((err) => {
    console.log('Error conectando a MongoDB:', err.message);
  });

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
