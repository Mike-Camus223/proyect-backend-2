import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.config.js';

const PORT = config.port;

// Conectar a la base de datos e inicializar el servidor Express
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT} (modo: ${config.nodeEnv})`);
  });
});
